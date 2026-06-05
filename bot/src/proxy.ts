import { createServer } from 'http'
import { config } from './config.js'

// Serves fixture data publicly so Somnia Agents can call it without auth headers.
// Start with: BOT_PROXY_PORT=3001 (default)
// Expose with: npx localtunnel --port 3001 OR ngrok http 3001
// Then set FIXTURE_API_URL=https://<tunnel-url>?id=FIXTURE_ID

const PORT = Number(process.env.BOT_PROXY_PORT ?? 3001)

export function startProxy(): void {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://localhost:${PORT}`)
    const id = url.searchParams.get('id') ?? config.fixtureId

    try {
      const upstream = await fetch(
        `https://v3.football.api-sports.io/fixtures?id=${id}`,
        { headers: { 'x-apisports-key': config.sportsApiKey } },
      )
      const json = await upstream.json()
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(json))
    } catch (err) {
      res.writeHead(502, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: String(err) }))
    }
  })

  server.listen(PORT, () => {
    console.log(`Fixture proxy listening on http://localhost:${PORT}`)
    console.log(`Expose it with: npx localtunnel --port ${PORT}`)
    console.log(`Then set FIXTURE_API_URL=https://<tunnel-url>?id=${config.fixtureId}`)
  })
}
