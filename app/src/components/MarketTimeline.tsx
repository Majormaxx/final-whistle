import { MarketStatus, Outcome } from '@final-whistle/sdk'
import { stt, kickoffLabel } from '@/lib/format'
import type { NextGoalMarketInfo } from '@final-whistle/sdk'

// Same chain-derived fields page.tsx already fetches for every window —
// status and result are final the moment a window resolves, so this renders
// a complete history for a finished match exactly as it would mid-game. One
// component covers both the live progress view and the post-match replay.
function rowMeta(w: NextGoalMarketInfo): { dot: string; label: string; detail: string } {
  if (w.status === MarketStatus.Open) {
    return { dot: 'bg-green-500 animate-pulse', label: 'Live', detail: 'Betting open — resolves on the next goal or window close' }
  }
  if (w.status === MarketStatus.Closed) {
    return { dot: 'bg-amber-500', label: 'Closed', detail: 'Awaiting agent resolution' }
  }
  if (w.status === MarketStatus.Cancelled) {
    return { dot: 'bg-zinc-600', label: 'Cancelled', detail: 'Window cancelled — stakes refundable' }
  }
  // Resolved
  if (w.result === Outcome.Yes) {
    return { dot: 'bg-green-500', label: 'Goal scored', detail: 'YES paid out to winners' }
  }
  return { dot: 'bg-zinc-500', label: 'No goal', detail: 'NO paid out to winners' }
}

function TimelineRow({ window: w, index, isLast }: { window: NextGoalMarketInfo; index: number; isLast: boolean }) {
  const meta = rowMeta(w)
  const goalsBefore = Number(w.goalsBefore)

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center shrink-0">
        <span className={`w-2.5 h-2.5 rounded-full mt-1 ${meta.dot}`} />
        {!isLast && <span className="w-px flex-1 bg-zinc-800 mt-1.5" />}
      </div>
      <div className={`flex-1 min-w-0 ${isLast ? '' : 'pb-5'}`}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-zinc-200">
            Window {index + 1} · {kickoffLabel(w.windowStart)}–{kickoffLabel(w.windowEnd)}
          </span>
          <span className="text-[11px] font-semibold text-zinc-400 shrink-0">{meta.label}</span>
        </div>
        <div className="text-xs text-zinc-500 mt-0.5">
          {goalsBefore > 0 ? `Opened after goal #${goalsBefore}` : 'Opened at kickoff'} · {meta.detail}
        </div>
        <div className="text-[11px] text-zinc-600 mt-1">Pool {stt(w.pool, 3)}</div>
      </div>
    </div>
  )
}

export function MarketTimeline({ windows }: { windows: NextGoalMarketInfo[] }) {
  if (windows.length === 0) return null
  const sorted = [...windows].sort((a, b) => Number(a.windowStart - b.windowStart))

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="text-sm font-semibold text-zinc-300 mb-4">
        Goal-window timeline
        <span className="ml-2 text-xs font-normal text-zinc-600">{sorted.length} window{sorted.length === 1 ? '' : 's'}</span>
      </div>
      <div>
        {sorted.map((w, i) => (
          <TimelineRow key={w.address} window={w} index={i} isLast={i === sorted.length - 1} />
        ))}
      </div>
    </div>
  )
}
