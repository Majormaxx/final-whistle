'use client'

import type { Fixture } from '@/lib/fixtures'

function timeLabel(f: Fixture): string {
  if (f.status === 'live' && f.elapsed != null) return `${f.elapsed}'`
  if (f.status === 'finished') return 'FT'
  const d = new Date(f.kickoff * 1000)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function scoreOrVs(f: Fixture): React.ReactNode {
  if (f.status === 'live' || f.status === 'finished') {
    const h = f.goals.home ?? 0
    const a = f.goals.away ?? 0
    return (
      <span className="text-white font-bold text-sm">{h} – {a}</span>
    )
  }
  return <span className="text-zinc-600 text-xs">vs</span>
}

export function FixtureRow({ fixture, isLast }: { fixture: Fixture; isLast: boolean }) {
  return (
    <div className={`flex items-center px-4 py-3 gap-3 opacity-70 ${!isLast ? 'border-b border-border' : ''}`}>
      {/* Status */}
      <div className="w-12 shrink-0">
        {fixture.status === 'live' ? (
          <span className="flex items-center gap-1 text-[11px] text-green-500 font-semibold">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            {timeLabel(fixture)}
          </span>
        ) : (
          <span className="text-[11px] text-zinc-500">{timeLabel(fixture)}</span>
        )}
        <div className="text-[10px] text-zinc-600 mt-0.5 truncate">{fixture.league}</div>
      </div>

      {/* Teams + score */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-300 truncate flex-1">{fixture.homeTeam}</span>
          <span className="shrink-0">{scoreOrVs(fixture)}</span>
          <span className="text-sm text-zinc-400 truncate flex-1 text-right">{fixture.awayTeam}</span>
        </div>
      </div>

      {/* Locked odds */}
      <div className="flex gap-2 shrink-0">
        {['1', 'X', '2'].map(label => (
          <div
            key={label}
            className="w-14 h-10 rounded-lg border border-zinc-800 bg-zinc-900/40 flex flex-col items-center justify-center cursor-not-allowed"
            title="No market yet — bot opens this at kickoff"
          >
            <div className="text-sm font-bold text-zinc-600">—</div>
            <div className="text-[10px] text-zinc-700">{label}</div>
          </div>
        ))}
      </div>

      {/* Spacer to align with MatchRow chevron */}
      <div className="w-5 shrink-0" />
    </div>
  )
}
