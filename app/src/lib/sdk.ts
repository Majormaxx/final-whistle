import { FinalWhistleClient } from '@final-whistle/sdk'
import type { Address } from 'viem'

const FACTORY  = process.env.NEXT_PUBLIC_FACTORY_ADDRESS  as Address
const RESOLVER = process.env.NEXT_PUBLIC_RESOLVER_ADDRESS as Address
const RPC      = process.env.NEXT_PUBLIC_RPC_URL ?? 'https://dream-rpc.somnia.network'

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
