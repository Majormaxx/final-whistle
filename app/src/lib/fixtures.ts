const SPORTS_KEY = process.env.SPORTS_API_KEY!

// Priority order — higher position = shown first when multiple leagues have games
const LEAGUE_PRIORITY = [
  1,   // FIFA World Cup
  2,   // UEFA Champions League
  3,   // UEFA Europa League
  5,   // UEFA Nations League
  848, // UEFA Conference League
  10,  // Friendlies (international — World Cup warm-ups etc.)
  666, // Friendlies Women
  39,  // Premier League
  140, // La Liga
  135, // Serie A
  78,  // Bundesliga
  61,  // Ligue 1
  13,  // Copa Libertadores
  11,  // Copa Sudamericana
  253, // MLS
  307, // Saudi Pro League
  98,  // J1 League
  88,  // Eredivisie
  94,  // Primeira Liga
]

const LIVE_STATUSES   = new Set(['1H', '2H', 'HT', 'ET', 'BT', 'P', 'INT'])
const DONE_STATUSES   = new Set(['FT', 'AET', 'PEN'])
const CANCEL_STATUSES = new Set(['CANC', 'ABD', 'AWD', 'WO'])

export type FixtureStatus = 'scheduled' | 'live' | 'finished'

export type Fixture = {
  id: number
  homeTeam: string
  awayTeam: string
  league: string
  country: string
  kickoff: number       // unix seconds
  status: FixtureStatus
  elapsed: number | null
  goals: { home: number | null; away: number | null }
}

export async function getTodayFixtures(limit = 5): Promise<Fixture[]> {
  if (!SPORTS_KEY) return []

  const today = new Date().toISOString().slice(0, 10)
  let res: Response
  try {
    res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}`, {
      headers: { 'x-apisports-key': SPORTS_KEY },
      next: { revalidate: 60 },
    })
  } catch {
    return []
  }

  if (!res.ok) return []
  const data = await res.json()
  const rows: any[] = data.response ?? []

  const priorityMap = new Map(LEAGUE_PRIORITY.map((id, i) => [id, i]))

  const sorted = rows
    .filter(r =>
      priorityMap.has(r.league.id) &&
      !CANCEL_STATUSES.has(r.fixture.status.short)
    )
    .sort((a, b) => {
      // Live first
      const aLive = LIVE_STATUSES.has(a.fixture.status.short) ? 0 : 1
      const bLive = LIVE_STATUSES.has(b.fixture.status.short) ? 0 : 1
      if (aLive !== bLive) return aLive - bLive
      // Then by league priority
      const pa = priorityMap.get(a.league.id) ?? 99
      const pb = priorityMap.get(b.league.id) ?? 99
      if (pa !== pb) return pa - pb
      // Within same league, sort by kickoff (earlier first)
      return a.fixture.timestamp - b.fixture.timestamp
    })
    .slice(0, limit)

  return sorted.map(r => ({
    id: r.fixture.id,
    homeTeam: r.teams.home.name,
    awayTeam: r.teams.away.name,
    league: r.league.name,
    country: r.league.country,
    kickoff: Math.floor(new Date(r.fixture.date).getTime() / 1000),
    status: LIVE_STATUSES.has(r.fixture.status.short) ? 'live'
          : DONE_STATUSES.has(r.fixture.status.short) ? 'finished'
          : 'scheduled',
    elapsed: r.fixture.status.elapsed ?? null,
    goals: { home: r.goals.home, away: r.goals.away },
  }))
}
