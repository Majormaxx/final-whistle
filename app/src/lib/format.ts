import { MarketStatus } from '@final-whistle/sdk'
import type { MatchMarketInfo } from '@final-whistle/sdk'
import type { Fixture } from './fixtures'

const SCALE = 10n ** 18n

export function pct(price: bigint): number {
  return Math.round(Number((price * 100n) / SCALE))
}

export function odds(price: bigint): string {
  const p = Number(price) / 1e18
  if (p <= 0) return '—'
  return (1 / p).toFixed(2)
}

export function stt(wei: bigint, decimals = 4): string {
  return (Number(wei) / 1e18).toFixed(decimals) + ' STT'
}

export function winEstimate(betWei: bigint, price: bigint): string {
  if (price === 0n) return '—'
  const est = (betWei * SCALE) / price
  return stt(est, 3)
}

export function shortAddr(addr: string): string {
  return addr.slice(0, 6) + '…' + addr.slice(-4)
}

export function kickoffLabel(ts: bigint): string {
  return new Date(Number(ts) * 1000).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit',
  })
}

export function countdownLabel(ts: bigint): string {
  const diff = Number(ts) - Math.floor(Date.now() / 1000)
  if (diff <= 0) return 'any moment now'
  const days = Math.floor(diff / 86_400)
  if (days > 0) return `in ${days}d`
  const hours = Math.floor(diff / 3_600)
  const minutes = Math.floor((diff % 3_600) / 60)
  if (hours > 0) return `in ${hours}h ${minutes}m`
  return `in ${minutes}m`
}

export type MatchPhase = 'pre' | 'live' | 'finished'

// Single source of truth for "what stage is this match in" — trusts the
// fixture feed when it has an answer (handles delays/postponements), falls
// back to the on-chain kickoff timestamp when the feed is missing or down.
// `Closed` folds into 'finished': it's the brief on-chain window between
// full-time and the resolver setting `Resolved`.
export function matchPhase(market: MatchMarketInfo, fixture?: Fixture | null): MatchPhase {
  if (market.status === MarketStatus.Resolved || market.status === MarketStatus.Closed) return 'finished'
  if (fixture) return fixture.status === 'finished' ? 'finished' : fixture.status === 'live' ? 'live' : 'pre'
  return Date.now() / 1000 >= Number(market.kickoff) ? 'live' : 'pre'
}
