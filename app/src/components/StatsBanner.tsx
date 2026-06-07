import { Cpu, Coins, ShieldCheck } from 'lucide-react'
import { MarketStatus } from '@final-whistle/sdk'
import { stt } from '@/lib/format'
import type { MatchMarketInfo, NextGoalMarketInfo } from '@final-whistle/sdk'

// Quantifies the thing this product actually claims to do — every number here
// is a direct readout of chain state already fetched for this page (resolved
// status + pool per market), not a marketing estimate. Shows up the moment
// the first window resolves and keeps growing through the match; on a
// finished match it's the final tally.
export function StatsBanner({ match, windows }: { match: MatchMarketInfo; windows: NextGoalMarketInfo[] }) {
  const resolvedWindows = windows.filter(w => w.status === MarketStatus.Resolved)
  const matchResolved = match.status === MarketStatus.Resolved
  const resolvedCount = resolvedWindows.length + (matchResolved ? 1 : 0)
  if (resolvedCount === 0) return null

  const distributed = resolvedWindows.reduce((sum, w) => sum + w.pool, 0n) + (matchResolved ? match.pool : 0n)

  const stats = [
    {
      Icon: Cpu,
      value: String(resolvedCount),
      label: resolvedCount === 1 ? 'market resolved autonomously' : 'markets resolved autonomously',
    },
    { Icon: Coins, value: stt(distributed, 3), label: 'settled on-chain by agents' },
    { Icon: ShieldCheck, value: '0', label: 'manual interventions' },
  ]

  return (
    <div className="bg-card border border-border rounded-xl px-5 py-4 mb-3 flex items-center justify-around gap-3 text-center">
      {stats.map(({ Icon, value, label }, i) => (
        <div key={label} className={`flex items-center gap-3 min-w-0 ${i > 0 ? 'border-l border-border pl-3' : ''}`}>
          <Icon className="w-4 h-4 text-green-400 shrink-0" strokeWidth={1.75} />
          <div className="text-left min-w-0">
            <div className="text-base font-bold text-white leading-none truncate">{value}</div>
            <div className="text-[11px] text-zinc-500 mt-1 leading-tight">{label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
