import 'dotenv/config'
import { createPublicClient, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { somniaTestnet, MarketFactoryAbi } from '@final-whistle/sdk'
import type { Address, Hash } from 'viem'

// Deploys a fresh MatchMarket via the factory — for seeding a demo match with
// a chosen kickoff. Dry-run by default (prints the resolved plan); pass
// --broadcast to actually send the transaction.
//
// Usage:
//   tsx scripts/createMatch.ts                # show what would be deployed
//   tsx scripts/createMatch.ts --broadcast    # deploy it for real

const TARGET_KICKOFF = 1_780_995_600 // Tue 9 Jun 2026, 10:00 local (WAT)
const TARGET_DATE    = '2026-06-09'
const FALLBACK_HOME  = 'Brazil'
const FALLBACK_AWAY  = 'Uruguay'
const MAX_DRIFT_SECS = 4 * 3600 // a "real fixture" must land within 4h of the target

function required(key: string): string {
  const v = process.env[key]
  if (!v) throw new Error(`Missing env var: ${key}`)
  return v
}

const PRIVATE_KEY     = required('BOT_PRIVATE_KEY') as `0x${string}`
const FACTORY_ADDRESS = required('FACTORY_ADDRESS') as Address
const RPC_URL         = process.env.RPC_URL ?? 'https://dream-rpc.somnia.network'
const SPORTS_API_KEY  = process.env.SPORTS_API_KEY

type FixtureMatch = { id: number; homeTeam: string; awayTeam: string; kickoff: number }

async function findFixtureNearTarget(): Promise<FixtureMatch | null> {
  if (!SPORTS_API_KEY) return null
  try {
    const res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${TARGET_DATE}`, {
      headers: { 'x-apisports-key': SPORTS_API_KEY },
    })
    if (!res.ok) return null
    const data = await res.json()
    const rows: any[] = data.response ?? []
    if (rows.length === 0) return null

    const closest = rows.reduce((best, r) =>
      Math.abs(r.fixture.timestamp - TARGET_KICKOFF) < Math.abs(best.fixture.timestamp - TARGET_KICKOFF) ? r : best
    )
    if (Math.abs(closest.fixture.timestamp - TARGET_KICKOFF) > MAX_DRIFT_SECS) return null

    return {
      id: closest.fixture.id,
      homeTeam: closest.teams.home.name,
      awayTeam: closest.teams.away.name,
      kickoff: closest.fixture.timestamp,
    }
  } catch {
    return null
  }
}

async function main() {
  const broadcast = process.argv.includes('--broadcast')

  const matched = await findFixtureNearTarget()
  const plan = matched
    ? { homeTeam: matched.homeTeam, awayTeam: matched.awayTeam, kickoff: matched.kickoff, fixtureId: matched.id as number | null, source: 'real fixture' }
    : { homeTeam: FALLBACK_HOME, awayTeam: FALLBACK_AWAY, kickoff: TARGET_KICKOFF, fixtureId: null as number | null, source: 'placeholder (no fixture matched within 4h of target — likely API rate limit)' }

  console.log('── Demo match plan ──')
  console.log(`  Source:   ${plan.source}`)
  console.log(`  Match:    ${plan.homeTeam} vs ${plan.awayTeam}`)
  console.log(`  Kickoff:  ${new Date(plan.kickoff * 1000).toString()}  (unix ${plan.kickoff})`)
  console.log(`  Fixture:  ${plan.fixtureId ?? '— (no live score/elapsed feed for this match)'}`)
  console.log()

  if (!broadcast) {
    console.log('Dry run only — re-run with --broadcast to deploy this on-chain.')
    return
  }

  const account  = privateKeyToAccount(PRIVATE_KEY)
  const wallet   = createWalletClient({ chain: somniaTestnet, transport: http(RPC_URL), account })
  const public_  = createPublicClient({ chain: somniaTestnet, transport: http(RPC_URL) })

  console.log('Broadcasting createMatchMarket...')
  const { request, result } = await public_.simulateContract({
    account,
    address: FACTORY_ADDRESS,
    abi: MarketFactoryAbi,
    functionName: 'createMatchMarket',
    args: [plan.homeTeam, plan.awayTeam, BigInt(plan.kickoff)],
  })
  const hash = await wallet.writeContract(request)
  console.log(`  tx: ${hash}`)
  await public_.waitForTransactionReceipt({ hash })

  const [marketAddress, marketId] = result as [Address, Hash]
  console.log()
  console.log('── Deployed ──')
  console.log(`  Market address: ${marketAddress}`)
  console.log(`  Market id:      ${marketId}`)
  console.log()
  console.log('Next steps:')
  console.log(`  app/.env.local  → prepend ${marketAddress} to NEXT_PUBLIC_SEEDED_MARKETS`)
  console.log(`                    set NEXT_PUBLIC_LIVE_FIXTURE_ID=${plan.fixtureId ?? '(leave as-is — placeholder match)'}`)
  console.log(`  bot/.env        → MATCH_MARKET_ADDRESS=${marketAddress}`)
  console.log(`                    KICKOFF_TIMESTAMP=${plan.kickoff}`)
  console.log(`                    FIXTURE_ID=${plan.fixtureId ?? '(leave as-is — placeholder match)'}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
