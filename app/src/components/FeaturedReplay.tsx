import Link from 'next/link'
import { History } from 'lucide-react'
import { stt } from '@/lib/format'
import { RESULT_LABEL } from '@/components/AgentActivity'
import type { MatchMarketInfo, NextGoalMarketInfo } from '@final-whistle/sdk'

// A condensed, chronological retelling of a match that's already resolved —
// kickoff to full time, opposite of AgentActivity's newest-first live feed,
// because a replay tells a story in order. Fills the cold "nothing live right
// now" state with proof the autonomous system already worked, on-chain.
export function FeaturedReplay({
  market,
  windows,
}: {
  market: MatchMarketInfo
  windows: NextGoalMarketInfo[]
}) {
  const entries = [...windows]
    .sort((a, b) => Number(a.windowStart - b.windowStart))
    .map((w, i) => ({
      id: w.address,
      text: `Window ${i + 1} — ${RESULT_LABEL[w.result] ?? 'settled'}`,
      detail: `${stt(w.pool, 3)} settled autonomously`,
    }))

  entries.push({
    id: `${market.address}-final`,
    text: `Full time — ${RESULT_LABEL[market.result] ?? 'settled'}`,
    detail: `${stt(market.pool, 3)} distributed — zero manual steps`,
  })

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2">
        <History className="w-3.5 h-3.5 text-zinc-500" strokeWidth={2} />
        <span className="text-sm font-semibold text-zinc-300">
          How {market.homeTeam} vs {market.awayTeam} wrapped up
        </span>
        <span className="text-[11px] text-zinc-600 ml-auto">Replay</span>
      </div>
      <div className="text-xs text-zinc-600 mt-1">
        Resolved autonomously, start to finish — no human in the loop.
      </div>

      <div className="mt-3 space-y-2.5">
        {entries.map(e => (
          <div key={e.id} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm text-zinc-200 truncate">{e.text}</div>
              <div className="text-[11px] text-zinc-600 truncate">{e.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <Link
        href={`/match/${market.address}`}
        className="block mt-3 pt-3 border-t border-border text-[11px] text-zinc-600 hover:text-zinc-300 transition-colors"
      >
        Full replay & timeline →
      </Link>
    </div>
  )
}
