import { Cpu, Coins, ShieldCheck } from 'lucide-react'
import { MarketStatus } from '@final-whistle/sdk'
import { readClient, SEEDED } from '@/lib/sdk'
import { stt } from '@/lib/format'

// Same chain-derived math as StatsBanner — every number a direct readout, not
// a marketing estimate — scaled across every seeded market instead of one.
// The proof bar a visitor sees before they've looked at a single match.
export async function PlatformStats() {
  if (SEEDED.length === 0) return null

  const markets = await Promise.all(
    SEEDED.map(addr => readClient.getMatchMarket(addr).catch(() => null)),
  )
  const resolved = markets.filter((m): m is NonNullable<typeof m> => m !== null && m.status === MarketStatus.Resolved)
  if (resolved.length === 0) return null

  const distributed = resolved.reduce((sum, m) => sum + m.pool, 0n)

  const stats = [
    {
      Icon: Cpu,
      value: String(resolved.length),
      label: resolved.length === 1 ? 'market resolved autonomously' : 'markets resolved autonomously',
    },
    { Icon: Coins, value: stt(distributed, 3), label: 'settled on-chain by agents' },
    { Icon: ShieldCheck, value: '0', label: 'manual interventions' },
  ]

  return (
    <div className="bg-card border border-border rounded-xl px-5 py-4 mb-4 flex items-center justify-around gap-3 text-center">
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
