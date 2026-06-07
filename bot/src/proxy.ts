import { createServer } from 'http'
import localtunnel from 'localtunnel'
import { config } from './config.js'

const PORT = Number(process.env.BOT_PROXY_PORT ?? 3001)
const MAX_ATTEMPTS = 3
const RETRY_DELAYS_MS = [500, 1500]

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

type FixturePayload = {
  response?: Array<{ goals?: { home?: number | null; away?: number | null } }>
}

// The on-chain resolver extracts response.0.goals.{home,away} via JSON path and
// abi.decodes the result as uint256. A malformed payload (e.g. an error blob with
// no `response` array) could be misread as a zeroed score, causing a market to
// settle on fabricated data — irreversibly. So this never forwards anything that
// doesn't look like a real, complete fixture result.
function isValidFixturePayload(json: unknown): json is FixturePayload {
  const fixture = (json as FixturePayload | undefined)?.response?.[0]
  return fixture?.goals != null && fixture.goals.home != null && fixture.goals.away != null
}

async function fetchFixtureWithRetry(id: string): Promise<FixturePayload> {
  let lastErr: unknown
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const upstream = await fetch(
        `https://v3.football.api-sports.io/fixtures?id=${id}`,
        { headers: { 'x-apisports-key': config.sportsApiKey } },
      )
      if (!upstream.ok) throw new Error(`upstream returned ${upstream.status}`)
      const json = await upstream.json()
      if (!isValidFixturePayload(json)) throw new Error('malformed fixture payload — missing goals data')
      return json
    } catch (err) {
      lastErr = err
      console.warn(`[proxy] Fixture fetch attempt ${attempt + 1}/${MAX_ATTEMPTS} failed:`, err)
      if (attempt < MAX_ATTEMPTS - 1) await sleep(RETRY_DELAYS_MS[attempt])
    }
  }
  throw lastErr
}

export async function startProxy(): Promise<string> {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://localhost:${PORT}`)
    const id = url.searchParams.get('id') ?? config.fixtureId

    try {
      const json = await fetchFixtureWithRetry(id)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(json))
    } catch (err) {
      // 503, never 200 — a clean failure the agent can retry beats forwarding
      // data that gets parsed into a (possibly wrong) on-chain settlement.
      console.error('[proxy] Fixture fetch exhausted retries:', err)
      res.writeHead(503, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'fixture data unavailable' }))
    }
  })

  await new Promise<void>(resolve => server.listen(PORT, resolve))
  console.log(`[proxy] Listening on http://localhost:${PORT}`)

  const tunnel = await localtunnel({ port: PORT })
  const fixtureUrl = `${tunnel.url}?id=${config.fixtureId}`
  console.log(`[proxy] Public URL: ${fixtureUrl}`)

  tunnel.on('error', err => console.error('[proxy] Tunnel error:', err))
  tunnel.on('close', () => console.warn('[proxy] Tunnel closed — resolution will fail'))

  return fixtureUrl
}
