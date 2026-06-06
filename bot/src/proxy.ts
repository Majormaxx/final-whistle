import { createServer } from 'http'
import localtunnel from 'localtunnel'
import { config } from './config.js'

const PORT = Number(process.env.BOT_PROXY_PORT ?? 3001)

export async function startProxy(): Promise<string> {
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

  await new Promise<void>(resolve => server.listen(PORT, resolve))
  console.log(`[proxy] Listening on http://localhost:${PORT}`)

  const tunnel = await localtunnel({ port: PORT })
  const fixtureUrl = `${tunnel.url}?id=${config.fixtureId}`
  console.log(`[proxy] Public URL: ${fixtureUrl}`)

  tunnel.on('error', err => console.error('[proxy] Tunnel error:', err))
  tunnel.on('close', () => console.warn('[proxy] Tunnel closed — resolution will fail'))

  return fixtureUrl
}
