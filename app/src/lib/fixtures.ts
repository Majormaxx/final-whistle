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
  homeLogo: string | null
  awayLogo: string | null
  leagueLogo: string | null
  league: string
  country: string
  kickoff: number       // unix seconds
  status: FixtureStatus
  elapsed: number | null
  goals: { home: number | null; away: number | null }
}

// Shared fetch+filter+map for a single date — sorted by league priority, then
// kickoff. Each call independently try/catches so one rate-limited or
// off-window date contributes nothing rather than failing a whole batch.
async function fetchFixturesForDate(date: string): Promise<Fixture[]> {
  let res: Response
  try {
    res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${date}`, {
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

  return rows
    .filter(r =>
      priorityMap.has(r.league.id) &&
      !CANCEL_STATUSES.has(r.fixture.status.short)
    )
    .sort((a, b) => {
      const pa = priorityMap.get(a.league.id) ?? 99
      const pb = priorityMap.get(b.league.id) ?? 99
      if (pa !== pb) return pa - pb
      return a.fixture.timestamp - b.fixture.timestamp
    })
    .map(r => ({
      id: r.fixture.id,
      homeTeam: r.teams.home.name,
      awayTeam: r.teams.away.name,
      homeLogo: r.teams.home.logo ?? null,
      awayLogo: r.teams.away.logo ?? null,
      leagueLogo: r.league.logo ?? null,
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

export async function getTodayFixtures(limit = 5): Promise<Fixture[]> {
  if (!SPORTS_KEY) return []

  const today = new Date().toISOString().slice(0, 10)
  const fixtures = await fetchFixturesForDate(today)

  // Live first, stable otherwise — preserves the league-priority/kickoff
  // order already applied per group.
  return [...fixtures]
    .sort((a, b) => (a.status === 'live' ? 0 : 1) - (b.status === 'live' ? 0 : 1))
    .slice(0, limit)
}

// Browses forward from today across as many days as the plan's rolling
// window actually serves (the free tier covers ~3 days — querying further
// just returns an off-window error that fetchFixturesForDate swallows).
// Each date's fixtures stay grouped and internally sorted — exactly what a
// day-by-day browser needs — then the whole run is capped at `limit`.
export async function getFixturesForDays(days: number, limit: number): Promise<Fixture[]> {
  if (!SPORTS_KEY) return []

  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setUTCDate(d.getUTCDate() + i)
    return d.toISOString().slice(0, 10)
  })

  const batches = await Promise.all(dates.map(fetchFixturesForDate))
  return batches.flat().slice(0, limit)
}
