const SCALE = 10n ** 18n

export function pct(price: bigint): number {
  return Math.round(Number((price * 100n) / SCALE))
}

export function odds(price: bigint): string {
  const p = Number(price) / 1e18
  if (p <= 0) return '—'
  return (1 / p).toFixed(2) + 'x'
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
