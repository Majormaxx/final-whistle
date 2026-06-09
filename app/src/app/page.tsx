import { Suspense } from 'react'
import { readClient, SEEDED } from '@/lib/sdk'
import { getTodayFixtures } from '@/lib/fixtures'
import { MatchRow } from '@/components/MatchRow'
import { FixtureRow } from '@/components/FixtureRow'
import { Hero } from '@/components/Hero'
import { FirstActionGuide } from '@/components/FirstActionGuide'
import { MyBets } from '@/components/MyBets'
import { AgentActivity } from '@/components/AgentActivity'
import { PlatformStats } from '@/components/PlatformStats'
import { FeaturedReplay } from '@/components/FeaturedReplay'
import { FixturesPanel } from '@/components/FixturesPanel'
import { matchPhase } from '@/lib/format'
import { MarketStatus } from '@final-whistle/sdk'
import type { MatchMarketInfo, NextGoalMarketInfo } from '@final-whistle/sdk'
import type { Fixture } from '@/lib/fixtures'

export const revalidate = 60

const LIVE_FIXTURE_ID = Number(process.env.NEXT_PUBLIC_LIVE_FIXTURE_ID ?? 0)
const MAX_ROWS        = 5

type Row =
  | { type: 'market'; market: MatchMarketInfo; fixture: Fixture }
  | { type: 'fixture'; fixture: Fixture }

async function getLiveMarket(): Promise<MatchMarketInfo | null> {
  if (!SEEDED[0]) return null
  try { return await readClient.getMatchMarket(SEEDED[0]) } catch { return null }
}

// The proof source for the cold state — the most recently resolved match
// across every seeded market, independent of whichever one is currently
// "live" (that one might be pre-match with nothing to replay yet). Same
// fetch-and-filter shape as PlatformStats.
async function getReplayMatch(): Promise<{ market: MatchMarketInfo; windows: NextGoalMarketInfo[] } | null> {
  const markets = await Promise.all(SEEDED.map(a => readClient.getMatchMarket(a).catch(() => null)))
  const resolved = markets.filter((m): m is MatchMarketInfo => m !== null && m.status === MarketStatus.Resolved)
  if (resolved.length === 0) return null
  const market = resolved.reduce((a, b) => (a.kickoff > b.kickoff ? a : b))
  const windows = await Promise.all(
    (await readClient.getNextGoalMarkets(market.marketId)).map(a => readClient.getNextGoalMarket(a))
  )
  return { market, windows }
}

function MatchListSkeleton() {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="bg-zinc-900/60 px-4 py-2 border-b border-border">
        <div className="h-3 w-16 bg-zinc-800 rounded animate-pulse" />
      </div>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className={`flex items-center gap-3 px-4 py-4 ${i < 5 ? 'border-b border-border' : ''}`}>
          <div className="w-16 space-y-1.5">
            <div className="h-2.5 w-10 bg-zinc-800 rounded animate-pulse" />
            <div className="h-2 w-14 bg-zinc-800/60 rounded animate-pulse" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-zinc-800 animate-pulse" />
              <div className="h-3 w-28 bg-zinc-800 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-zinc-800/60 animate-pulse" />
              <div className="h-3 w-24 bg-zinc-800/60 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3].map(j => (
              <div key={j} className="w-14 h-12 rounded-lg bg-zinc-800/60 animate-pulse" />
            ))}
          </div>
          <div className="w-5 h-4 bg-zinc-800/40 rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}

async function MatchList() {
  const [liveMarket, apiFixtures] = await Promise.all([
    getLiveMarket(),
    getTodayFixtures(MAX_ROWS),
  ])

  const liveWindows = liveMarket
    ? await Promise.all(
        (await readClient.getNextGoalMarkets(liveMarket.marketId)).map(a => readClient.getNextGoalMarket(a))
      )
    : []

  const matchedFixture = liveMarket ? apiFixtures.find(f => f.id === LIVE_FIXTURE_ID) ?? null : null
  const phase = liveMarket ? matchPhase(liveMarket, matchedFixture) : null
  // The currently-tracked match might be pre-match or just-seeded — nothing
  // to replay yet. The proof for the cold state comes from whichever seeded
  // match most recently finished, which may be a different address entirely.
  const replay = phase !== 'live' ? await getReplayMatch() : null

  const rows: Row[] = []

  if (liveMarket) {
    const syntheticFixture: Fixture = matchedFixture ?? {
      id: LIVE_FIXTURE_ID,
      homeTeam: liveMarket.homeTeam,
      awayTeam: liveMarket.awayTeam,
      homeLogo: null,
      awayLogo: null,
      leagueLogo: null,
      league: 'World Cup Qualification',
      country: 'World',
      kickoff: Number(liveMarket.kickoff),
      status: Number(liveMarket.kickoff) * 1000 > Date.now() ? 'scheduled' : 'live',
      elapsed: null,
      goals: { home: null, away: null },
    }
    rows.push({ type: 'market', market: liveMarket, fixture: syntheticFixture })
  }

  const shownIds = new Set(rows.map(r => r.fixture.id))
  for (const f of apiFixtures) {
    if (rows.length >= MAX_ROWS) break
    if (shownIds.has(f.id)) continue
    rows.push({ type: 'fixture', fixture: f })
  }

  if (rows.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-600">
        <div className="text-5xl mb-4">⚽</div>
        <div className="text-sm">Nothing kicking off today — check back soon.</div>
      </div>
    )
  }

  return (
    <>
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="bg-zinc-900/60 px-4 py-2 flex items-center justify-between text-[11px] uppercase tracking-widest text-zinc-500 font-medium border-b border-border">
          <span>Match</span>
          <div className="flex gap-1.5 items-center pr-9">
            <span className="w-14 text-center">1</span>
            <span className="w-14 text-center">X</span>
            <span className="w-14 text-center">2</span>
          </div>
        </div>
        {rows.map((row, i) => {
          const isLast = i === rows.length - 1
          if (row.type === 'market') {
            return <MatchRow key={row.fixture.id} market={row.market} fixture={row.fixture} isLast={isLast} />
          }
          return <FixtureRow key={row.fixture.id} fixture={row.fixture} isLast={isLast} />
        })}
      </div>

      {phase === 'live' ? (
        <div className="mt-4">
          <AgentActivity
            matchAddress={liveMarket!.address}
            parentMatchId={liveMarket!.marketId}
            initialWindows={liveWindows}
          />
        </div>
      ) : replay ? (
        <div className="mt-4">
          <FeaturedReplay market={replay.market} windows={replay.windows} />
        </div>
      ) : null}
    </>
  )
}

export default function Home() {
  return (
    <div>
      <Hero />
      <FirstActionGuide />

      <Suspense fallback={null}>
        <PlatformStats />
      </Suspense>

      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Today's matches</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Goal goes in, payout goes out — automatically, on-chain.</p>
        </div>
        <FixturesPanel />
      </div>

      <Suspense fallback={<MatchListSkeleton />}>
        <MatchList />
      </Suspense>

      <MyBets />
    </div>
  )
}
