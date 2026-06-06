'use client'

import type { Fixture } from '@/lib/fixtures'

function TeamLogo({ src, alt }: { src: string | null; alt: string }) {
  if (!src) return <div className="w-5 h-5 rounded-full bg-zinc-800 shrink-0" />
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} width={20} height={20}
      className="w-5 h-5 object-contain shrink-0"
      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
    />
  )
}

function timeLabel(f: Fixture): string {
  if (f.status === 'live' && f.elapsed != null) return `${f.elapsed}'`
  if (f.status === 'finished') return 'FT'
  const d = new Date(f.kickoff * 1000)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function FixtureRow({ fixture, isLast }: { fixture: Fixture; isLast: boolean }) {
  const hasScore = fixture.status === 'live' || fixture.status === 'finished'

  return (
    <div className={`flex items-center px-4 py-3 gap-3 ${!isLast ? 'border-b border-border' : ''}`}>
      {/* Status + league */}
      <div className="w-16 shrink-0">
        {fixture.status === 'live' ? (
          <span className="flex items-center gap-1 text-[11px] text-green-500 font-semibold">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shrink-0" />
            {timeLabel(fixture)}
          </span>
        ) : (
          <span className="text-[11px] text-zinc-500">{timeLabel(fixture)}</span>
        )}
        <div className="text-[11px] text-zinc-600 mt-0.5 truncate w-16">{fixture.league}</div>
      </div>

      {/* Teams + logos + score */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <TeamLogo src={fixture.homeLogo} alt={fixture.homeTeam} />
              <span className="text-sm font-semibold text-white truncate">{fixture.homeTeam}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TeamLogo src={fixture.awayLogo} alt={fixture.awayTeam} />
              <span className="text-sm text-zinc-400 truncate">{fixture.awayTeam}</span>
            </div>
          </div>
          {hasScore && (
            <div className="shrink-0 text-center px-2">
              <div className="text-base font-bold text-white tabular-nums">{fixture.goals.home ?? 0}</div>
              <div className="text-base font-bold text-white tabular-nums">{fixture.goals.away ?? 0}</div>
            </div>
          )}
        </div>
      </div>

      {/* Locked odds — no market yet */}
      <div className="flex gap-1.5 shrink-0">
        {(['1', 'X', '2'] as const).map(label => (
          <div
            key={label}
            className="w-14 h-12 rounded-lg border border-zinc-800 bg-zinc-900/20 flex flex-col items-center justify-center gap-0.5"
          >
            <div className="text-xs font-bold text-zinc-700">{label}</div>
            <div className="text-[10px] text-zinc-800">—</div>
          </div>
        ))}
      </div>

      {/* Spacer to align with MatchRow chevron */}
      <div className="w-5 shrink-0" />
    </div>
  )
}
