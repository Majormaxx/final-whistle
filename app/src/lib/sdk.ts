import { FinalWhistleClient } from '@final-whistle/sdk'
import type { Address } from 'viem'

const FACTORY  = process.env.NEXT_PUBLIC_FACTORY_ADDRESS  as Address
const RESOLVER = process.env.NEXT_PUBLIC_RESOLVER_ADDRESS as Address
const RPC      = process.env.NEXT_PUBLIC_RPC_URL ?? 'https://dream-rpc.somnia.network'

// Known match market addresses, seeded at deploy time — the pragmatic stand-in
// for an indexer (listMatchMarkets can't scan from genesis: the Somnia RPC
// caps eth_getLogs at 1000 blocks and the factory is millions of blocks deep).
export const SEEDED = (process.env.NEXT_PUBLIC_SEEDED_MARKETS ?? '')
  .split(',').map(a => a.trim().toLowerCase()).filter(Boolean) as Address[]

// Read-only client for server components and data fetching
export const readClient = new FinalWhistleClient({
  rpcUrl:          RPC,
  factoryAddress:  FACTORY,
  resolverAddress: RESOLVER,
})

// Wallet client — created per-request with the user's private key
export function walletClient(privateKey: `0x${string}`) {
  return new FinalWhistleClient({
    rpcUrl:          RPC,
    factoryAddress:  FACTORY,
    resolverAddress: RESOLVER,
    privateKey,
  })
}
