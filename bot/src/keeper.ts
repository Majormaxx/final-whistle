import {
  createPublicClient,
  createWalletClient,
  http,
  type Address,
  type Hash,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import {
  FinalWhistleClient,
  somniaTestnet,
  MarketStatus,
  ResolverAgentAbi,
  MarketFactoryAbi,
  MatchMarketAbi,
  NextGoalMarketAbi,
} from '@final-whistle/sdk'
import { config } from './config.js'
import { fetchMatchState } from './sports-api.js'

interface LatestWindow {
  address:     Address
  goalsBefore: number
  status:      MarketStatus
}

// 3 hours from kickoff — generous fallback for windowEnd (goal-reactive close is primary)
const WINDOW_END_BUFFER = 3 * 60 * 60

export class Keeper {
  private readonly client:  FinalWhistleClient
  private readonly account: ReturnType<typeof privateKeyToAccount>
  private readonly wallet:  ReturnType<typeof createWalletClient>
  private readonly public_: ReturnType<typeof createPublicClient>
  private readonly fixtureApiUrl: string

  // Running PnL in wei — cosmetic bookkeeping only. Losing it on restart
  // doesn't cause an incorrect on-chain action, so it's fine in memory.
  private spent:    bigint = 0n
  private received: bigint = 0n

  // Markets this process has already fired initiateXResolution for. Unlike
  // the lifecycle state this rewrite eliminated, losing this on restart can't
  // produce a WRONG on-chain action — at worst one redundant initiate call,
  // which burns a deposit and reverts harmlessly when the duplicate resolve()
  // lands after the first callback. See _hasPendingResolution for why this
  // can't be derived from chain history instead.
  private readonly resolutionInitiated = new Set<Address>()

  constructor(fixtureApiUrl: string) {
    this.fixtureApiUrl = fixtureApiUrl
    this.account = privateKeyToAccount(config.privateKey)
    this.public_ = createPublicClient({ chain: somniaTestnet, transport: http(config.rpcUrl) })
    this.wallet  = createWalletClient({ chain: somniaTestnet, transport: http(config.rpcUrl), account: this.account })
    this.client  = new FinalWhistleClient({
      rpcUrl:          config.rpcUrl,
      factoryAddress:  config.factoryAddress,
      resolverAddress: config.resolverAddress,
      privateKey:      config.privateKey,
    })
  }

  async start(): Promise<void> {
    console.log(`Keeper started — address: ${this.account.address}`)
    console.log(`Match market: ${config.matchMarketAddress}`)

    await this._betMatchMarket()
    this._watchMarketResolutions()

    while (true) {
      try {
        await this._tick()
      } catch (err) {
        // Nothing in _tick mutates in-memory lifecycle state before its
        // on-chain writes land, so a failure here costs nothing but a poll
        // cycle — the next tick re-derives the same truth and resumes.
        console.error('Tick failed — re-deriving state and retrying next cycle:', err)
      }
      await sleep(config.pollIntervalMs)
    }
  }

  // ── main tick ─────────────────────────────────────────────────────────
  //
  // No lifecycle state is kept across ticks. Every cycle re-reads "what does
  // the chain say is open right now" and "what does the live feed say the
  // score is right now", and acts only on the gap between the two. A crash
  // at any point — mid-spawn, mid-rotation, mid-finalize — loses nothing:
  // the next tick asks the same two questions, gets the same answers (the
  // chain doesn't forget what it already did), and continues from there.

  private async _tick(): Promise<void> {
    let matchState
    try {
      matchState = await fetchMatchState(config.fixtureId, config.sportsApiKey)
    } catch (err) {
      console.error('Sports API error:', err)
      return
    }
    const { phase, totalGoals, elapsed } = matchState

    const matchId = await this._matchMarketId()
    const [matchStatus, latestWindow] = await Promise.all([
      this._marketStatus(config.matchMarketAddress, MatchMarketAbi),
      this._latestWindow(matchId),
    ])

    console.log(
      `[${elapsed}'] phase=${phase} goals=${totalGoals} match=${MarketStatus[matchStatus]} ` +
      `window=${latestWindow ? `${latestWindow.address} (goalsBefore=${latestWindow.goalsBefore}, ${MarketStatus[latestWindow.status]})` : 'none'}`,
    )

    if (matchStatus === MarketStatus.Resolved) return // fully settled — nothing left to do

    if (phase === 'FINISHED') {
      await this._finalize(latestWindow)
      return
    }

    if (phase !== 'LIVE' && phase !== 'HALFTIME') return // SCHEDULED — wait for kickoff

    if (!latestWindow || latestWindow.status !== MarketStatus.Open) {
      // No open window. Either this is kickoff (no window exists yet), or
      // we're recovering mid-rotation (the latest window is Closed/Resolved
      // but a fresh one was never spawned). Finish whatever's pending first,
      // then open a window at the current goal count either way.
      if (latestWindow && latestWindow.status !== MarketStatus.Resolved) {
        console.log(`Recovering: ${latestWindow.address} is ${MarketStatus[latestWindow.status]} — finishing its resolution before spawning a fresh window`)
        await this._closeAndResolveWindow(latestWindow)
      }
      console.log(latestWindow ? 'Spawning replacement window' : 'Match kicked off — spawning first next-goal window')
      await this._spawnWindow(totalGoals)
      return
    }

    if (totalGoals > latestWindow.goalsBefore) {
      console.log(`Goal detected! ${latestWindow.goalsBefore} → ${totalGoals}`)
      await this._closeAndResolveWindow(latestWindow)
      await this._spawnWindow(totalGoals)
    }
  }

  // ── chain-state derivation — single source of truth, read fresh every time ─

  private async _marketStatus(address: Address, abi: typeof MatchMarketAbi | typeof NextGoalMarketAbi): Promise<MarketStatus> {
    return Number(await this.public_.readContract({ address, abi, functionName: 'status' })) as MarketStatus
  }

  private async _latestWindow(matchId: Hash): Promise<LatestWindow | null> {
    const windows = await this.public_.readContract({
      address:      config.factoryAddress,
      abi:          MarketFactoryAbi,
      functionName: 'getNextGoalMarkets',
      args:         [matchId],
    }) as Address[]
    if (windows.length === 0) return null

    const address = windows[windows.length - 1]
    const [status, goalsBefore] = await Promise.all([
      this._marketStatus(address, NextGoalMarketAbi),
      this.public_.readContract({ address, abi: NextGoalMarketAbi, functionName: 'goalsBefore' }) as Promise<bigint>,
    ])
    return { address, status, goalsBefore: Number(goalsBefore) }
  }

  // True if THIS process has already fired initiateXResolution for `market`
  // and is waiting on the agent callback.
  //
  // This is intentionally NOT derived from ResolutionInitiated event history —
  // that approach was tried and measured to be unreliable on Somnia. The chain
  // produces a block roughly every 100ms (measured: 900 blocks spans ~90s),
  // while the agent platform's callback latency runs into minutes (measured:
  // ~5 minutes on a live resolution in this codebase's test run). A query
  // window wide enough to cover real callback latency would need tens of
  // thousands of blocks — far past Somnia's ~1000-block getLogs range cap —
  // and paginating that range requires either an archive node (to read
  // `status` at arbitrary historical blocks, to know where to stop) or
  // assumptions about the platform's worst-case latency that have no
  // contractual backing. A 900-block window was tried first and produced a
  // real duplicate initiateMatchResolution in production: the event had
  // already scrolled out of range by the time the next successful tick ran.
  //
  // So: remember it ourselves for the life of this process. Losing this set on
  // restart cannot cause a wrong settlement — _tick still derives "what window
  // are we in / has the match finished" purely from chain reads, as it always
  // has. The only failure mode of an empty set is one redundant deposit and a
  // harmless revert on the second resolve() — bounded, self-correcting, and
  // far cheaper than the alternative of inventing brittle on-chain heuristics.
  private _hasPendingResolution(market: Address): boolean {
    return this.resolutionInitiated.has(market)
  }

  // ── window lifecycle ──────────────────────────────────────────────────
  //
  // Every write here re-checks on-chain status immediately before acting, so
  // each step is safe to re-issue from any starting point: a half-finished
  // attempt resumes from wherever it actually got to, instead of replaying
  // steps that already landed (which would revert — closeMarket on an
  // already-Closed market reverts "not open", same for resolve on Resolved).

  private async _spawnWindow(goalsBefore: number): Promise<void> {
    const windowStart = BigInt(Math.floor(Date.now() / 1000))
    const windowEnd   = BigInt(config.kickoffTimestamp + WINDOW_END_BUFFER)
    const matchId     = await this._matchMarketId()

    const { request, result } = await this.public_.simulateContract({
      account:      this.account,
      address:      config.factoryAddress,
      abi:          MarketFactoryAbi,
      functionName: 'spawnNextGoalMarket',
      args:         [matchId, windowStart, windowEnd, BigInt(goalsBefore)],
    })
    const hash = await this.wallet.writeContract(request)
    await this.public_.waitForTransactionReceipt({ hash })

    const [marketAddress] = result as [Address, Hash]
    console.log(`Spawned next-goal window: ${marketAddress} (goalsBefore=${goalsBefore})`)

    await this._betYes(marketAddress)
  }

  private async _closeAndResolveWindow(window: { address: Address; goalsBefore: number }): Promise<void> {
    let status = await this._marketStatus(window.address, NextGoalMarketAbi)

    if (status === MarketStatus.Open) {
      const closeHash = await this.wallet.writeContract({
        account:      this.account,
        address:      config.resolverAddress,
        abi:          ResolverAgentAbi,
        functionName: 'closeMarket',
        args:         [window.address],
      })
      await this.public_.waitForTransactionReceipt({ hash: closeHash })
      console.log(`Closed window ${window.address}`)
      status = MarketStatus.Closed
    }

    if (status !== MarketStatus.Closed) return // already Resolved — nothing left to do

    if (this._hasPendingResolution(window.address)) {
      console.log(`Resolution already initiated for ${window.address} — waiting for agent callback`)
      return
    }

    const deposit = await this.public_.readContract({
      address:      config.resolverAddress,
      abi:          ResolverAgentAbi,
      functionName: 'requiredDeposit',
    }) as bigint

    const resolveHash = await this.wallet.writeContract({
      account:      this.account,
      address:      config.resolverAddress,
      abi:          ResolverAgentAbi,
      functionName: 'initiateNextGoalResolution',
      args:         [window.address, this.fixtureApiUrl, BigInt(window.goalsBefore)],
      value:        deposit * 2n,
    })
    await this.public_.waitForTransactionReceipt({ hash: resolveHash })
    this.resolutionInitiated.add(window.address)
    console.log(`Resolution initiated for window ${window.address} (goalsBefore=${window.goalsBefore})`)
  }

  // Match finished — resolve the final window (if any still pending), then
  // close + resolve the match market itself. Same idempotent shape as above:
  // re-checks status before each write so it can be entered from any point.
  private async _finalize(window: LatestWindow | null): Promise<void> {
    if (window && window.status !== MarketStatus.Resolved) {
      await this._closeAndResolveWindow(window)
    }

    let matchStatus = await this._marketStatus(config.matchMarketAddress, MatchMarketAbi)

    if (matchStatus === MarketStatus.Open) {
      const closeHash = await this.wallet.writeContract({
        account:      this.account,
        address:      config.resolverAddress,
        abi:          ResolverAgentAbi,
        functionName: 'closeMarket',
        args:         [config.matchMarketAddress],
      })
      await this.public_.waitForTransactionReceipt({ hash: closeHash })
      console.log(`Closed match market ${config.matchMarketAddress}`)
      matchStatus = MarketStatus.Closed
    }

    if (matchStatus !== MarketStatus.Closed) return // already Resolved

    if (this._hasPendingResolution(config.matchMarketAddress)) {
      console.log('Match resolution already initiated — waiting for agent callback')
      return
    }

    const deposit = await this.public_.readContract({
      address:      config.resolverAddress,
      abi:          ResolverAgentAbi,
      functionName: 'requiredDeposit',
    }) as bigint

    const resolveHash = await this.wallet.writeContract({
      account:      this.account,
      address:      config.resolverAddress,
      abi:          ResolverAgentAbi,
      functionName: 'initiateMatchResolution',
      args:         [config.matchMarketAddress, this.fixtureApiUrl],
      value:        deposit * 2n,
    })
    await this.public_.waitForTransactionReceipt({ hash: resolveHash })
    this.resolutionInitiated.add(config.matchMarketAddress)
    console.log('Match resolution initiated')
  }

  // ── betting ───────────────────────────────────────────────────────────

  // Seed match market with bets on all three outcomes
  private async _betMatchMarket(): Promise<void> {
    const perOutcome = config.betSizeWei / 3n
    for (const outcome of [0, 1, 2] as const) {
      try {
        const hash = await this.client.betMatch(config.matchMarketAddress, outcome, perOutcome)
        await this.public_.waitForTransactionReceipt({ hash })
        this.spent += perOutcome
        console.log(`Bet match outcome ${outcome}: ${perOutcome} wei`)
      } catch (err) {
        console.error(`Match bet outcome ${outcome} failed:`, err)
      }
    }
  }

  private async _betYes(marketAddress: Address): Promise<void> {
    try {
      const hash = await this.client.betNextGoal(marketAddress, 0, config.betSizeWei)
      await this.public_.waitForTransactionReceipt({ hash })
      this.spent += config.betSizeWei
      console.log(`Bet YES on window ${marketAddress}: ${config.betSizeWei} wei`)
    } catch (err) {
      console.error(`YES bet failed on ${marketAddress}:`, err)
    }
  }

  // ── event watchers ────────────────────────────────────────────────────

  private _watchMarketResolutions(): void {
    // Watch match market for resolution → claim
    this.client.watchMarketResolved(config.matchMarketAddress, MatchMarketAbi, async () => {
      console.log('Match market resolved — claiming')
      try {
        const hash = await this.client.claimMatch(config.matchMarketAddress)
        await this.public_.waitForTransactionReceipt({ hash })
      } catch (_) { /* nothing to claim */ }
    })

    // Watch factory for new next-goal windows → attach resolution watcher
    this.client.watchNextGoalMarketCreated(async (event) => {
      this.client.watchMarketResolved(event.market, NextGoalMarketAbi, async () => {
        console.log(`Next-goal market ${event.market} resolved — claiming`)
        try {
          const hash = await this.client.claimNextGoal(event.market)
          await this.public_.waitForTransactionReceipt({ hash })
        } catch (_) { /* nothing to claim */ }
      })
    })
  }

  // ── helpers ───────────────────────────────────────────────────────────

  private _cachedMarketId: Hash | null = null
  private async _matchMarketId(): Promise<Hash> {
    if (this._cachedMarketId) return this._cachedMarketId
    const id = await this.public_.readContract({
      address:      config.matchMarketAddress,
      abi:          MatchMarketAbi,
      functionName: 'marketId',
    }) as Hash
    this._cachedMarketId = id
    return id
  }

  pnlSummary(): string {
    const net = this.received - this.spent
    const sign = net >= 0n ? '+' : '-'
    return `spent=${fmt(this.spent)} received=${fmt(this.received)} net=${sign}${fmt(net < 0n ? -net : net)}`
  }
}

function fmt(wei: bigint): string {
  return `${Number(wei) / 1e18} STT`
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
