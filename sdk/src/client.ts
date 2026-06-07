import {
  createPublicClient,
  createWalletClient,
  http,
  parseEventLogs,
  type Address,
  type Hash,
  type PublicClient,
  type WalletClient,
  type Log,
} from 'viem'
import { privateKeyToAccount, type PrivateKeyAccount } from 'viem/accounts'
import { MarketFactoryAbi } from './abis/MarketFactory.js'
import { MatchMarketAbi } from './abis/MatchMarket.js'
import { NextGoalMarketAbi } from './abis/NextGoalMarket.js'
import { ResolverAgentAbi } from './abis/ResolverAgent.js'
import { somniaTestnet, LMSR_SCALE } from './constants.js'
import type {
  FinalWhistleConfig,
  MatchMarketInfo,
  NextGoalMarketInfo,
  MatchMarketCreatedEvent,
  NextGoalMarketCreatedEvent,
  BetPlacedEvent,
  MarketResolvedEvent,
  ResolutionInitiatedEvent,
  PayoutSentEvent,
  BetEstimate,
} from './types.js'
import { MarketStatus, Outcome } from './types.js'

export class FinalWhistleClient {
  readonly public: PublicClient
  readonly wallet: WalletClient | null
  readonly account: PrivateKeyAccount | null
  readonly factoryAddress: Address
  readonly resolverAddress: Address | null

  constructor(config: FinalWhistleConfig) {
    this.public = createPublicClient({
      chain: somniaTestnet,
      transport: http(config.rpcUrl),
    })

    if (config.privateKey) {
      this.account = privateKeyToAccount(config.privateKey)
      this.wallet = createWalletClient({
        chain: somniaTestnet,
        transport: http(config.rpcUrl),
        account: this.account,
      })
    } else {
      this.account = null
      this.wallet = null
    }

    this.factoryAddress   = config.factoryAddress
    this.resolverAddress  = config.resolverAddress ?? null
  }

  // ── factory reads ──────────────────────────────────────────────────────

  async getMatchMarketAddress(marketId: Hash): Promise<Address> {
    return this.public.readContract({
      address: this.factoryAddress,
      abi: MarketFactoryAbi,
      functionName: 'matchMarkets',
      args: [marketId],
    }) as Promise<Address>
  }

  async getNextGoalMarkets(parentMatchId: Hash): Promise<Address[]> {
    return this.public.readContract({
      address: this.factoryAddress,
      abi: MarketFactoryAbi,
      functionName: 'getNextGoalMarkets',
      args: [parentMatchId],
    }) as Promise<Address[]>
  }

  // ── match market reads ─────────────────────────────────────────────────

  async getMatchMarket(address: Address): Promise<MatchMarketInfo> {
    const [homeTeam, awayTeam, kickoff, status, result, pool, quantities, marketId] =
      await Promise.all([
        this.public.readContract({ address, abi: MatchMarketAbi, functionName: 'homeTeam' }),
        this.public.readContract({ address, abi: MatchMarketAbi, functionName: 'awayTeam' }),
        this.public.readContract({ address, abi: MatchMarketAbi, functionName: 'kickoff' }),
        this.public.readContract({ address, abi: MatchMarketAbi, functionName: 'status' }),
        this.public.readContract({ address, abi: MatchMarketAbi, functionName: 'result' }),
        this.public.readContract({ address, abi: MatchMarketAbi, functionName: 'pool' }),
        this.public.readContract({ address, abi: MatchMarketAbi, functionName: 'getQuantities' }),
        this.public.readContract({ address, abi: MatchMarketAbi, functionName: 'marketId' }),
      ])

    const [p0, p1, p2] = await Promise.all([
      this.public.readContract({ address, abi: MatchMarketAbi, functionName: 'getPrice', args: [0] }),
      this.public.readContract({ address, abi: MatchMarketAbi, functionName: 'getPrice', args: [1] }),
      this.public.readContract({ address, abi: MatchMarketAbi, functionName: 'getPrice', args: [2] }),
    ])

    return {
      address,
      marketId: marketId as Hash,
      homeTeam: homeTeam as string,
      awayTeam: awayTeam as string,
      kickoff: kickoff as bigint,
      status: Number(status) as MarketStatus,
      result: Number(result) as Outcome,
      pool: pool as bigint,
      quantities: quantities as [bigint, bigint, bigint],
      prices: [p0 as bigint, p1 as bigint, p2 as bigint],
    }
  }

  // ── next goal market reads ─────────────────────────────────────────────

  async getNextGoalMarket(address: Address): Promise<NextGoalMarketInfo> {
    const [parentMatchId, windowStart, windowEnd, goalsBefore, status, result, pool, marketId] =
      await Promise.all([
        this.public.readContract({ address, abi: NextGoalMarketAbi, functionName: 'parentMatchId' }),
        this.public.readContract({ address, abi: NextGoalMarketAbi, functionName: 'windowStart' }),
        this.public.readContract({ address, abi: NextGoalMarketAbi, functionName: 'windowEnd' }),
        this.public.readContract({ address, abi: NextGoalMarketAbi, functionName: 'goalsBefore' }),
        this.public.readContract({ address, abi: NextGoalMarketAbi, functionName: 'status' }),
        this.public.readContract({ address, abi: NextGoalMarketAbi, functionName: 'result' }),
        this.public.readContract({ address, abi: NextGoalMarketAbi, functionName: 'pool' }),
        this.public.readContract({ address, abi: NextGoalMarketAbi, functionName: 'marketId' }),
      ])

    const [q0, q1, p0, p1] = await Promise.all([
      this.public.readContract({ address, abi: NextGoalMarketAbi, functionName: 'quantities', args: [0n] }),
      this.public.readContract({ address, abi: NextGoalMarketAbi, functionName: 'quantities', args: [1n] }),
      this.public.readContract({ address, abi: NextGoalMarketAbi, functionName: 'getPrice', args: [0] }),
      this.public.readContract({ address, abi: NextGoalMarketAbi, functionName: 'getPrice', args: [1] }),
    ])

    return {
      address,
      marketId: marketId as Hash,
      parentMatchId: parentMatchId as Hash,
      windowStart: windowStart as bigint,
      windowEnd: windowEnd as bigint,
      goalsBefore: goalsBefore as bigint,
      status: Number(status) as MarketStatus,
      result: Number(result) as Outcome,
      pool: pool as bigint,
      quantities: [q0 as bigint, q1 as bigint],
      prices: [p0 as bigint, p1 as bigint],
    }
  }

  // ── bet helpers ────────────────────────────────────────────────────────

  // Estimate cost of buying `amount` worth of shares on a MatchMarket outcome.
  // Uses current LMSR price as a first-order approximation. The contract is authoritative.
  async estimateMatchBet(
    marketAddress: Address,
    outcome: 0 | 1 | 2,
    amount: bigint,
  ): Promise<BetEstimate> {
    const [priceNow, priceAfter] = await Promise.all([
      this.public.readContract({
        address: marketAddress, abi: MatchMarketAbi,
        functionName: 'getPrice', args: [outcome],
      }) as Promise<bigint>,
      // price after is approximate since we can't call the LMSR lib directly off-chain
      this.public.readContract({
        address: marketAddress, abi: MatchMarketAbi,
        functionName: 'getPrice', args: [outcome],
      }) as Promise<bigint>,
    ])
    const cost = (amount * priceNow) / LMSR_SCALE
    return { cost, shares: amount, priceAfter }
  }

  // Place a bet on a MatchMarket. outcome: 0=HOME, 1=DRAW, 2=AWAY
  async betMatch(
    marketAddress: Address,
    outcome: 0 | 1 | 2,
    amount: bigint,
  ): Promise<Hash> {
    this._requireWallet()
    return this.wallet!.writeContract({
      account: this.account!,
      chain: somniaTestnet,
      address: marketAddress,
      abi: MatchMarketAbi,
      functionName: 'bet',
      args: [outcome],
      value: amount,
    })
  }

  // Place a bet on a NextGoalMarket. outcome: 0=YES, 1=NO
  async betNextGoal(
    marketAddress: Address,
    outcome: 0 | 1,
    amount: bigint,
  ): Promise<Hash> {
    this._requireWallet()
    return this.wallet!.writeContract({
      account: this.account!,
      chain: somniaTestnet,
      address: marketAddress,
      abi: NextGoalMarketAbi,
      functionName: 'bet',
      args: [outcome],
      value: amount,
    })
  }

  // ── payout ─────────────────────────────────────────────────────────────

  async payoutMatchBatch(marketAddress: Address, bettors: Address[]): Promise<Hash> {
    this._requireWallet()
    return this.wallet!.writeContract({
      account: this.account!,
      chain: somniaTestnet,
      address: marketAddress,
      abi: MatchMarketAbi,
      functionName: 'payoutBatch',
      args: [bettors],
    })
  }

  async payoutNextGoalBatch(marketAddress: Address, bettors: Address[]): Promise<Hash> {
    this._requireWallet()
    return this.wallet!.writeContract({
      account: this.account!,
      chain: somniaTestnet,
      address: marketAddress,
      abi: NextGoalMarketAbi,
      functionName: 'payoutBatch',
      args: [bettors],
    })
  }

  // How much `account` would receive by calling claim() right now — 0n if the
  // market isn't resolved yet, they didn't back the winning outcome, or they
  // (or a payoutBatch run) already claimed and zeroed their shares. Mirrors
  // the contract's own payout math read-only, since neither market exposes a
  // "previewClaim" view — this is the only way to show the amount in the UI
  // before the user spends gas finding out.
  async getClaimableMatch(marketAddress: Address, account: Address): Promise<bigint> {
    const [status, result, pool] = await Promise.all([
      this.public.readContract({ address: marketAddress, abi: MatchMarketAbi, functionName: 'status' }) as Promise<number>,
      this.public.readContract({ address: marketAddress, abi: MatchMarketAbi, functionName: 'result' }) as Promise<number>,
      this.public.readContract({ address: marketAddress, abi: MatchMarketAbi, functionName: 'pool' }) as Promise<bigint>,
    ])
    if (Number(status) !== MarketStatus.Resolved) return 0n
    const winIdx = Number(result) - Outcome.Home // HOME=1→0, DRAW=2→1, AWAY=3→2
    if (winIdx < 0 || winIdx > 2) return 0n

    const [winShares, totalWinShares] = await Promise.all([
      this.public.readContract({ address: marketAddress, abi: MatchMarketAbi, functionName: 'shares', args: [account, BigInt(winIdx)] }) as Promise<bigint>,
      this.public.readContract({ address: marketAddress, abi: MatchMarketAbi, functionName: 'quantities', args: [BigInt(winIdx)] }) as Promise<bigint>,
    ])
    if (winShares === 0n || totalWinShares === 0n) return 0n
    return (pool * winShares) / totalWinShares
  }

  // Same as getClaimableMatch but for the binary YES/NO shape of NextGoalMarket.
  async getClaimableNextGoal(marketAddress: Address, account: Address): Promise<bigint> {
    const [status, result, pool] = await Promise.all([
      this.public.readContract({ address: marketAddress, abi: NextGoalMarketAbi, functionName: 'status' }) as Promise<number>,
      this.public.readContract({ address: marketAddress, abi: NextGoalMarketAbi, functionName: 'result' }) as Promise<number>,
      this.public.readContract({ address: marketAddress, abi: NextGoalMarketAbi, functionName: 'pool' }) as Promise<bigint>,
    ])
    if (Number(status) !== MarketStatus.Resolved) return 0n
    const winIdx = Number(result) === Outcome.Yes ? 0 : Number(result) === Outcome.No ? 1 : -1
    if (winIdx < 0) return 0n

    const [winShares, totalWinShares] = await Promise.all([
      this.public.readContract({ address: marketAddress, abi: NextGoalMarketAbi, functionName: 'shares', args: [account, BigInt(winIdx)] }) as Promise<bigint>,
      this.public.readContract({ address: marketAddress, abi: NextGoalMarketAbi, functionName: 'quantities', args: [BigInt(winIdx)] }) as Promise<bigint>,
    ])
    if (winShares === 0n || totalWinShares === 0n) return 0n
    return (pool * winShares) / totalWinShares
  }

  async claimMatch(marketAddress: Address): Promise<Hash> {
    this._requireWallet()
    return this.wallet!.writeContract({
      account: this.account!,
      chain: somniaTestnet,
      address: marketAddress,
      abi: MatchMarketAbi,
      functionName: 'claim',
    })
  }

  async claimNextGoal(marketAddress: Address): Promise<Hash> {
    this._requireWallet()
    return this.wallet!.writeContract({
      account: this.account!,
      chain: somniaTestnet,
      address: marketAddress,
      abi: NextGoalMarketAbi,
      functionName: 'claim',
    })
  }

  // ── resolution ─────────────────────────────────────────────────────────

  async initiateMatchResolution(
    marketAddress: Address,
    fixtureApiUrl: string,
  ): Promise<Hash> {
    this._requireWallet()
    this._requireResolver()
    const deposit = await this.public.readContract({
      address: this.resolverAddress!,
      abi: ResolverAgentAbi,
      functionName: 'requiredDeposit',
    }) as bigint
    return this.wallet!.writeContract({
      account: this.account!,
      chain: somniaTestnet,
      address: this.resolverAddress!,
      abi: ResolverAgentAbi,
      functionName: 'initiateMatchResolution',
      args: [marketAddress, fixtureApiUrl],
      value: deposit * 2n,
    })
  }

  async initiateNextGoalResolution(
    marketAddress: Address,
    fixtureApiUrl: string,
    goalsBefore: bigint,
  ): Promise<Hash> {
    this._requireWallet()
    this._requireResolver()
    const deposit = await this.public.readContract({
      address: this.resolverAddress!,
      abi: ResolverAgentAbi,
      functionName: 'requiredDeposit',
    }) as bigint
    return this.wallet!.writeContract({
      account: this.account!,
      chain: somniaTestnet,
      address: this.resolverAddress!,
      abi: ResolverAgentAbi,
      functionName: 'initiateNextGoalResolution',
      args: [marketAddress, fixtureApiUrl, goalsBefore],
      value: deposit * 2n,
    })
  }

  // ── event subscriptions ────────────────────────────────────────────────

  watchMatchMarketCreated(
    onEvent: (event: MatchMarketCreatedEvent) => void,
  ): () => void {
    return this.public.watchContractEvent({
      address: this.factoryAddress,
      abi: MarketFactoryAbi,
      eventName: 'MatchMarketCreated',
      onLogs: (logs) => {
        for (const log of logs) {
          const args = log.args as any
          onEvent({
            marketId: args.marketId,
            market: args.market,
            homeTeam: args.homeTeam,
            awayTeam: args.awayTeam,
            kickoff: args.kickoff,
            log: log as Log,
          })
        }
      },
    })
  }

  watchNextGoalMarketCreated(
    onEvent: (event: NextGoalMarketCreatedEvent) => void,
  ): () => void {
    return this.public.watchContractEvent({
      address: this.factoryAddress,
      abi: MarketFactoryAbi,
      eventName: 'NextGoalMarketCreated',
      onLogs: (logs) => {
        for (const log of logs) {
          const args = log.args as any
          onEvent({
            marketId: args.marketId,
            market: args.market,
            parentMatchId: args.parentMatchId,
            windowStart: args.windowStart,
            windowEnd: args.windowEnd,
            log: log as Log,
          })
        }
      },
    })
  }

  watchBetsPlaced(
    marketAddress: Address,
    abi: typeof MatchMarketAbi | typeof NextGoalMarketAbi,
    onEvent: (event: BetPlacedEvent) => void,
  ): () => void {
    return this.public.watchContractEvent({
      address: marketAddress,
      abi,
      eventName: 'BetPlaced',
      onLogs: (logs) => {
        for (const log of logs) {
          const args = log.args as any
          onEvent({
            bettor: args.bettor,
            outcome: Number(args.outcome),
            shares: args.shares,
            cost: args.cost,
            log: log as Log,
          })
        }
      },
    })
  }

  watchMarketResolved(
    marketAddress: Address,
    abi: typeof MatchMarketAbi | typeof NextGoalMarketAbi,
    onEvent: (event: MarketResolvedEvent) => void,
  ): () => void {
    return this.public.watchContractEvent({
      address: marketAddress,
      abi,
      eventName: 'MarketResolved',
      onLogs: (logs) => {
        for (const log of logs) {
          const args = log.args as any
          onEvent({ result: Number(args.result) as Outcome, log: log as Log })
        }
      },
    })
  }

  watchPayoutSent(
    marketAddress: Address,
    abi: typeof MatchMarketAbi | typeof NextGoalMarketAbi,
    onEvent: (event: PayoutSentEvent) => void,
  ): () => void {
    return this.public.watchContractEvent({
      address: marketAddress,
      abi,
      eventName: 'PayoutSent',
      onLogs: (logs) => {
        for (const log of logs) {
          const args = log.args as any
          onEvent({ bettor: args.bettor, amount: args.amount, log: log as Log })
        }
      },
    })
  }

  // Resolver fires this the moment it deposits and asks the agent platform to
  // read a score — the earliest on-chain signal that a settlement is in flight.
  watchResolutionInitiated(
    onEvent: (event: ResolutionInitiatedEvent) => void,
  ): () => void {
    this._requireResolver()
    return this.public.watchContractEvent({
      address: this.resolverAddress!,
      abi: ResolverAgentAbi,
      eventName: 'ResolutionInitiated',
      onLogs: (logs) => {
        for (const log of logs) {
          const args = log.args as any
          onEvent({
            market: args.market,
            homeReqId: args.homeReqId,
            awayReqId: args.awayReqId,
            log: log as Log,
          })
        }
      },
    })
  }

  // ── historical event fetch ─────────────────────────────────────────────

  async listMatchMarkets(fromBlock = 0n): Promise<Address[]> {
    const logs = await this.public.getLogs({
      address: this.factoryAddress,
      fromBlock,
      toBlock: 'latest',
    })
    const parsed = parseEventLogs({
      abi: MarketFactoryAbi,
      logs,
      eventName: 'MatchMarketCreated',
    })
    return parsed.map((e) => (e as any).args.market as Address)
  }

  // ── internal ──────────────────────────────────────────────────────────

  private _requireWallet(): void {
    if (!this.wallet || !this.account) throw new Error('No private key — read-only client')
  }

  private _requireResolver(): void {
    if (!this.resolverAddress) throw new Error('No resolverAddress in config')
  }
}
