import { Keeper } from './keeper.js'
import { startProxy } from './proxy.js'

async function main() {
  const fixtureApiUrl = await startProxy()
  console.log(`[bot] Fixture API URL: ${fixtureApiUrl}`)

  const keeper = new Keeper(fixtureApiUrl)

  setInterval(() => {
    console.log(`[PnL] ${keeper.pnlSummary()}`)
  }, 60_000)

  await keeper.start()
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
