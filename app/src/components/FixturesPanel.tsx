'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, Loader2, X } from 'lucide-react'
import { FixtureRow } from '@/components/FixtureRow'
import type { Fixture } from '@/lib/fixtures'

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function dayLabel(kickoff: number): string {
  const diffDays = Math.round(
    (startOfDay(new Date(kickoff * 1000)).getTime() - startOfDay(new Date()).getTime()) / 86_400_000
  )
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  return new Date(kickoff * 1000).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
}

type DayGroup = { label: string; international: Fixture[]; club: Fixture[] }

function groupByDay(fixtures: Fixture[]): DayGroup[] {
  const order: string[] = []
  const byLabel = new Map<string, Fixture[]>()
  for (const f of fixtures) {
    const label = dayLabel(f.kickoff)
    if (!byLabel.has(label)) { byLabel.set(label, []); order.push(label) }
    byLabel.get(label)!.push(f)
  }
  return order.map(label => {
    const list = byLabel.get(label)!
    return {
      label,
      international: list.filter(f => f.country === 'World'),
      club: list.filter(f => f.country !== 'World'),
    }
  })
}

function FixtureSection({ title, fixtures }: { title: string; fixtures: Fixture[] }) {
  return (
    <div>
      <div className="px-5 pt-3 pb-1 text-[11px] text-zinc-600">{title}</div>
      {fixtures.map((f, i) => (
        <FixtureRow key={f.id} fixture={f} isLast={i === fixtures.length - 1} />
      ))}
    </div>
  )
}

export function FixturesPanel() {
  const [open, setOpen] = useState(false)
  const [fixtures, setFixtures] = useState<Fixture[] | null>(null)

  useEffect(() => {
    if (!open || fixtures !== null) return
    let cancelled = false
    fetch('/api/fixtures')
      .then(r => r.json())
      .then(d => { if (!cancelled) setFixtures(Array.isArray(d.fixtures) ? d.fixtures : []) })
      .catch(() => { if (!cancelled) setFixtures([]) })
    return () => { cancelled = true }
  }, [open, fixtures])

  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = original
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const groups = fixtures ? groupByDay(fixtures) : []

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-border text-zinc-400 hover:text-zinc-200 text-xs font-medium rounded-lg transition-colors"
      >
        <CalendarDays className="w-3.5 h-3.5" strokeWidth={2} />
        Browse fixtures
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Fixtures browser"
            onClick={e => e.stopPropagation()}
            className="relative bg-card border border-border rounded-xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-slide-down"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div>
                <h2 className="text-sm font-semibold text-white">Fixtures</h2>
                <p className="text-xs text-zinc-500 mt-0.5">International & club football, day by day</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="shrink-0 text-zinc-600 hover:text-zinc-300 transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {fixtures === null ? (
                <div className="px-5 py-12 text-center text-sm text-zinc-500">
                  <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin text-zinc-600" />
                  Loading fixtures…
                </div>
              ) : groups.length === 0 ? (
                <div className="px-5 py-12 text-center text-sm text-zinc-500">
                  Fixture data is refreshing — check back shortly.
                </div>
              ) : (
                groups.map(g => (
                  <div key={g.label}>
                    <div className="bg-zinc-900/60 px-5 py-2 text-[11px] uppercase tracking-widest text-zinc-500 font-medium border-b border-border sticky top-0">
                      {g.label}
                    </div>
                    {g.international.length > 0 && <FixtureSection title="International" fixtures={g.international} />}
                    {g.club.length > 0 && <FixtureSection title="Club" fixtures={g.club} />}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
