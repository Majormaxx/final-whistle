import 'dotenv/config'
import type { Address } from 'viem'

function required(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required env var: ${key}`)
  return val
}

export const config = {
  privateKey:          required('BOT_PRIVATE_KEY') as `0x${string}`,
  factoryAddress:      required('FACTORY_ADDRESS') as Address,
  resolverAddress:     required('RESOLVER_ADDRESS') as Address,
  matchMarketAddress:  required('MATCH_MARKET_ADDRESS') as Address,
  kickoffTimestamp:    Number(required('KICKOFF_TIMESTAMP')),
  fixtureId:           required('FIXTURE_ID'),
  sportsApiKey:        required('SPORTS_API_KEY'),
  // Auto-derived from localtunnel at startup if not set
  fixtureApiUrl:       process.env.FIXTURE_API_URL ?? '',
  rpcUrl:              process.env.RPC_URL ?? 'https://dream-rpc.somnia.network',
  betSizeWei:          BigInt(process.env.BET_SIZE_WEI ?? String(5n * 10n ** 15n)),
  pollIntervalMs:      Number(process.env.POLL_INTERVAL_MS ?? 30_000),
} as const
