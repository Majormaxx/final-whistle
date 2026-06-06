import { readClient } from '@/lib/sdk'
import { getTodayFixtures } from '@/lib/fixtures'
import { MatchRow } from '@/components/MatchRow'
import { FixtureRow } from '@/components/FixtureRow'
import { Hero } from '@/components/Hero'
import type { MatchMarketInfo } from '@final-whistle/sdk'
import type { Fixture } from '@/lib/fixtures'
import type { Address } from 'viem'

export const revalidate = 60

const SEEDED          = (process.env.NEXT_PUBLIC_SEEDED_MARKETS ?? '')
  .split(',').map(a => a.trim().toLowerCase()).filter(Boolean) as Address[]
const LIVE_FIXTURE_ID = Number(process.env.NEXT_PUBLIC_LIVE_FIXTURE_ID ?? 0)
const MAX_ROWS        = 5

type Row =
  | { type: 'market'; market: MatchMarketInfo; fixture: Fixture }
  | { type: 'fixture'; fixture: Fixture }

async function getLiveMarket(): Promise<MatchMarketInfo | null> {
  if (!SEEDED[0]) return null
  try { return await readClient.getMatchMarket(SEEDED[0]) } catch { return null }
}

export default async function Home() {
  const [liveMarket, apiFixtures] = await Promise.all([
    getLiveMarket(),
    getTodayFixtures(MAX_ROWS),
  ])

  const rows: Row[] = []

  // Pin the live on-chain market first, as a MatchRow
  if (liveMarket) {
    // Find corresponding fixture from API if available
    const matchedFixture = apiFixtures.find(f => f.id === LIVE_FIXTURE_ID)
    const syntheticFixture: Fixture = matchedFixture ?? {
      id: LIVE_FIXTURE_ID,
      homeTeam: liveMarket.homeTeam,
      awayTeam: liveMarket.awayTeam,
      league: 'World Cup Qualification',
      country: 'World',
      kickoff: Number(liveMarket.kickoff),
      status: 'live',
      elapsed: null,
      goals: { home: null, away: null },
    }
    rows.push({ type: 'market', market: liveMarket, fixture: syntheticFixture })
  }

  // Fill remaining slots from API fixtures (skip any already shown)
  const shownIds = new Set(rows.map(r => r.fixture.id))
  for (const f of apiFixtures) {
    if (rows.length >= MAX_ROWS) break
    if (shownIds.has(f.id)) continue
    rows.push({ type: 'fixture', fixture: f })
  }

  return (
    <div>
      <Hero />

      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Today's matches</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Live markets settle on-chain when goals are scored.</p>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-20 text-zinc-600">
          <div className="text-5xl mb-4">⚽</div>
          <div className="text-sm">No matches today.</div>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="bg-zinc-900/60 px-4 py-2 flex items-center justify-between text-[11px] uppercase tracking-widest text-zinc-500 font-medium border-b border-border">
            <span>Match</span>
            <div className="flex gap-2 items-center">
              <span className="w-14 text-center">1</span>
              <span className="w-14 text-center">X</span>
              <span className="w-14 text-center">2</span>
              <span className="w-5" />
            </div>
          </div>

          {rows.map((row, i) => {
            const isLast = i === rows.length - 1
            if (row.type === 'market') {
              return <MatchRow key={row.fixture.id} market={row.market} isLast={isLast} />
            }
            return <FixtureRow key={row.fixture.id} fixture={row.fixture} isLast={isLast} />
          })}
        </div>
      )}
    </div>
  )
}
