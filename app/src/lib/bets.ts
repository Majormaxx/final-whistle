const KEY = 'fw_bets_v1'

export type MarketType = 'match' | 'nextGoal'

export type StoredBet = {
  txHash: string
  marketAddress: string
  marketType: MarketType
  homeTeam: string
  awayTeam: string
  league: string
  outcome: 0 | 1 | 2
  amount: string
  timestamp: number
}

// Bets saved before `marketType` existed are recoverable: NextGoalPanel has
// always tagged its bets with league 'In-play' (and outcome 0|1, never 2) —
// the only place that string is used. Re-derive instead of dropping history.
export function marketTypeOf(bet: StoredBet): MarketType {
  return bet.marketType ?? (bet.league === 'In-play' ? 'nextGoal' : 'match')
}

export function saveBet(bet: StoredBet) {
  if (typeof window === 'undefined') return
  const existing = loadBets()
  const deduped = existing.filter(b => b.txHash !== bet.txHash)
  localStorage.setItem(KEY, JSON.stringify([bet, ...deduped].slice(0, 50)))
}

export function loadBets(): StoredBet[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}
