export type BetErrorKind = 'rejected' | 'funds' | 'network' | 'unknown'

export function classifyBetError(err: unknown): BetErrorKind {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase()
  if (msg.includes('reject') || msg.includes('denied') || msg.includes('cancel') || msg.includes('user refused')) return 'rejected'
  if (msg.includes('insufficient') || msg.includes('exceeds balance') || msg.includes('out of gas')) return 'funds'
  if (msg.includes('timeout') || msg.includes('network') || msg.includes('fetch failed') || msg.includes('etimedout')) return 'network'
  return 'unknown'
}

export const BET_ERROR_MSG: Record<Exclude<BetErrorKind, 'rejected'>, string> = {
  funds:   'Not enough STT — grab some from the faucet above',
  network: 'Network error — try again',
  unknown: 'Transaction failed — try again',
}
