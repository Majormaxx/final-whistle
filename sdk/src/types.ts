import type { Address, Hash, Log } from 'viem'

// ── enums ─────────────────────────────────────────────────────────────────

export enum MarketStatus {
  Open       = 0,
  Closed     = 1,
  Resolved   = 2,
  Cancelled  = 3,
}

export enum Outcome {
  None = 0,
  Home = 1,
  Draw = 2,
  Away = 3,
  Yes  = 4,
  No   = 5,
}

export enum ResponseStatus {
  None     = 0,
  Pending  = 1,
  Success  = 2,
  Failed   = 3,
  TimedOut = 4,
}

// ── market types ──────────────────────────────────────────────────────────

export interface MatchMarketInfo {
  address: Address
  marketId: Hash
  homeTeam: string
  awayTeam: string
  kickoff: bigint
  status: MarketStatus
  result: Outcome
  pool: bigint
  quantities: [bigint, bigint, bigint] // [HOME, DRAW, AWAY]
  prices: [bigint, bigint, bigint]     // scaled 1e18
}

export interface NextGoalMarketInfo {
  address: Address
  marketId: Hash
  parentMatchId: Hash
  windowStart: bigint
  windowEnd: bigint
  goalsBefore: bigint
  status: MarketStatus
  result: Outcome
  pool: bigint
  quantities: [bigint, bigint] // [YES, NO]
  prices: [bigint, bigint]     // scaled 1e18
}

// ── event types ───────────────────────────────────────────────────────────

export interface MatchMarketCreatedEvent {
  marketId: Hash
  market: Address
  homeTeam: string
  awayTeam: string
  kickoff: bigint
  log: Log
}

export interface NextGoalMarketCreatedEvent {
  marketId: Hash
  market: Address
  parentMatchId: Hash
  windowStart: bigint
  windowEnd: bigint
  log: Log
}

export interface BetPlacedEvent {
  bettor: Address
  outcome: number
  shares: bigint
  cost: bigint
  log: Log
}

export interface MarketResolvedEvent {
  result: Outcome
  log: Log
}

export interface ResolutionInitiatedEvent {
  market: Address
  homeReqId: bigint
  awayReqId: bigint
  log: Log
}

export interface PayoutSentEvent {
  bettor: Address
  amount: bigint
  log: Log
}

export interface ResolutionFailedEvent {
  requestId: bigint
  status: ResponseStatus
  log: Log
}

export interface EmergencyResolvedEvent {
  market: Address
  result: Outcome
  log: Log
}

// ── client config ─────────────────────────────────────────────────────────

export interface FinalWhistleConfig {
  rpcUrl: string
  factoryAddress: Address
  resolverAddress?: Address
  privateKey?: `0x${string}`
}

// ── bet helpers ───────────────────────────────────────────────────────────

export interface BetEstimate {
  cost: bigint        // wei — what you actually pay after LMSR pricing
  shares: bigint      // shares you receive (same as amount for this LMSR impl)
  priceAfter: bigint  // new outcome price after bet, scaled 1e18
}
