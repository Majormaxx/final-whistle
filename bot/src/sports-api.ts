export type MatchPhase = 'SCHEDULED' | 'LIVE' | 'HALFTIME' | 'FINISHED'

export interface MatchState {
  phase:       MatchPhase
  goalsHome:   number
  goalsAway:   number
  totalGoals:  number
  elapsed:     number  // minutes
}

const LIVE_STATUSES      = new Set(['1H', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE'])
const FINISHED_STATUSES  = new Set(['FT', 'AET', 'PEN', 'AWD', 'WO'])

export async function fetchMatchState(fixtureId: string, apiKey: string): Promise<MatchState> {
  const res = await fetch(`https://v3.football.api-sports.io/fixtures?id=${fixtureId}`, {
    headers: { 'x-apisports-key': apiKey },
  })

  if (!res.ok) throw new Error(`Sports API error: ${res.status} ${res.statusText}`)

  const json = await res.json() as {
    response: Array<{
      fixture: { status: { short: string; elapsed: number | null } }
      goals:   { home: number | null; away: number | null }
    }>
  }

  const fixture = json.response[0]
  if (!fixture) throw new Error(`No fixture found for id ${fixtureId}`)

  const short = fixture.fixture.status.short

  let phase: MatchPhase
  if (short === 'HT')                    phase = 'HALFTIME'
  else if (FINISHED_STATUSES.has(short)) phase = 'FINISHED'
  else if (LIVE_STATUSES.has(short))     phase = 'LIVE'
  else                                   phase = 'SCHEDULED'

  const goalsHome  = fixture.goals.home  ?? 0
  const goalsAway  = fixture.goals.away  ?? 0

  return {
    phase,
    goalsHome,
    goalsAway,
    totalGoals: goalsHome + goalsAway,
    elapsed:    fixture.fixture.status.elapsed ?? 0,
  }
}
