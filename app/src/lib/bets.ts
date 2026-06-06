const KEY = 'fw_bets_v1'

export type StoredBet = {
  txHash: string
  marketAddress: string
  homeTeam: string
  awayTeam: string
  league: string
  outcome: 0 | 1 | 2
  amount: string
  timestamp: number
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
