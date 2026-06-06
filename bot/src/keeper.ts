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
  ResolverAgentAbi,
  MarketFactoryAbi,
  MatchMarketAbi,
  NextGoalMarketAbi,
} from '@final-whistle/sdk'
import { config } from './config.js'
import { fetchMatchState, type MatchPhase } from './sports-api.js'

interface WindowState {
  address:     Address
  goalsBefore: number
}

interface KeeperState {
  phase:          MatchPhase
  lastGoalCount:  number
  currentWindow:  WindowState | null
  // running PnL in wei (signed)
  spent:    bigint
  received: bigint
}

// 3 hours from kickoff — generous fallback for windowEnd (goal-reactive close is primary)
const WINDOW_END_BUFFER = 3 * 60 * 60

export class Keeper {
  private readonly client:  FinalWhistleClient
  private readonly account: ReturnType<typeof privateKeyToAccount>
  private readonly wallet:  ReturnType<typeof createWalletClient>
  private readonly public_: ReturnType<typeof createPublicClient>
  private readonly fixtureApiUrl: string
  private state: KeeperState = {
    phase:         'SCHEDULED',
    lastGoalCount: 0,
    currentWindow: null,
    spent:         0n,
    received:      0n,
  }

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
      await this._tick()
      await sleep(config.pollIntervalMs)
    }
  }

  // ── main tick ─────────────────────────────────────────────────────────

  private async _tick(): Promise<void> {
    let matchState
    try {
      matchState = await fetchMatchState(config.fixtureId, config.sportsApiKey)
    } catch (err) {
      console.error('Sports API error:', err)
      return
    }

    const { phase, totalGoals, elapsed } = matchState
    const prev = this.state

    console.log(`[${elapsed}'] phase=${phase} goals=${totalGoals} window=${prev.currentWindow?.address ?? 'none'}`)

    if (prev.phase === 'SCHEDULED' && (phase === 'LIVE' || phase === 'HALFTIME')) {
      console.log('Match kicked off — spawning first next-goal window')
      this.state.phase = 'LIVE'
      this.state.lastGoalCount = totalGoals
      await this._spawnWindow(totalGoals)
      return
    }

    if (prev.phase !== 'LIVE') return

    if (phase === 'HALFTIME') {
      // HT: keep the current window open, bets still accepted
      return
    }

    if (phase === 'LIVE' && totalGoals > prev.lastGoalCount) {
      console.log(`Goal detected! ${prev.lastGoalCount} → ${totalGoals}`)
      await this._rotateWindow(prev.currentWindow!, totalGoals)
      return
    }

    if (phase === 'FINISHED') {
      console.log('Match finished — resolving all markets')
      this.state.phase = 'FINISHED'
      await this._finalize(prev.currentWindow, totalGoals)
    }
  }

  // ── window lifecycle ──────────────────────────────────────────────────

  private async _spawnWindow(goalsBefore: number): Promise<void> {
    const windowStart = BigInt(Math.floor(Date.now() / 1000))
    const windowEnd   = BigInt(config.kickoffTimestamp + WINDOW_END_BUFFER)

    const { result } = await this.wallet.simulateContract({
      account:      this.account,
      address:      config.factoryAddress,
      abi:          MarketFactoryAbi,
      functionName: 'spawnNextGoalMarket',
      args:         [
        await this._matchMarketId(),
        windowStart,
        windowEnd,
        BigInt(goalsBefore),
      ],
    })

    const hash = await this.wallet.writeContract({
      account:      this.account,
      address:      config.factoryAddress,
      abi:          MarketFactoryAbi,
      functionName: 'spawnNextGoalMarket',
      args:         [
        await this._matchMarketId(),
        windowStart,
        windowEnd,
        BigInt(goalsBefore),
      ],
    })
    await this.public_.waitForTransactionReceipt({ hash })

    const [marketAddress] = result as [Address, Hash]
    console.log(`Spawned next-goal window: ${marketAddress} (goalsBefore=${goalsBefore})`)

    this.state.currentWindow  = { address: marketAddress, goalsBefore }
    this.state.lastGoalCount  = goalsBefore

    await this._betYes(marketAddress)
  }

  // Close current window, initiate resolution, spawn fresh window.
  private async _rotateWindow(window: WindowState, newGoalCount: number): Promise<void> {
    await this._closeAndResolveWindow(window, newGoalCount)
    this.state.lastGoalCount = newGoalCount
    await this._spawnWindow(newGoalCount)
  }

  private async _closeAndResolveWindow(window: WindowState, currentGoals: number): Promise<void> {
    // Close via ResolverAgent (bot holds owner key)
    const closeHash = await this.wallet.writeContract({
      account:      this.account,
      address:      config.resolverAddress,
      abi:          ResolverAgentAbi,
      functionName: 'closeMarket',
      args:         [window.address],
    })
    await this.public_.waitForTransactionReceipt({ hash: closeHash })
    console.log(`Closed window ${window.address}`)

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
    console.log(`Resolution initiated for window ${window.address} (goalsBefore=${window.goalsBefore}, now=${currentGoals})`)
  }

  // Match finished — resolve final window + match market
  private async _finalize(window: WindowState | null, finalGoals: number): Promise<void> {
    if (window) {
      await this._closeAndResolveWindow(window, finalGoals)
      this.state.currentWindow = null
    }

    // Close match market (kickoff + 2h guard may not have passed yet — use closeMarket)
    const closeHash = await this.wallet.writeContract({
      account:      this.account,
      address:      config.resolverAddress,
      abi:          ResolverAgentAbi,
      functionName: 'closeMarket',
      args:         [config.matchMarketAddress],
    })
    await this.public_.waitForTransactionReceipt({ hash: closeHash })

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
        this.state.spent += perOutcome
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
      this.state.spent += config.betSizeWei
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
    const net = this.state.received - this.state.spent
    const sign = net >= 0n ? '+' : '-'
    return `spent=${fmt(this.state.spent)} received=${fmt(this.state.received)} net=${sign}${fmt(net < 0n ? -net : net)}`
  }
}

function fmt(wei: bigint): string {
  return `${Number(wei) / 1e18} STT`
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
