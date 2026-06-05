import { Keeper } from './keeper.js'
import { startProxy } from './proxy.js'

startProxy()

const keeper = new Keeper()

setInterval(() => {
  console.log(`[PnL] ${keeper.pnlSummary()}`)
}, 60_000)

keeper.start().catch(err => {
  console.error('Keeper crashed:', err)
  process.exit(1)
})
