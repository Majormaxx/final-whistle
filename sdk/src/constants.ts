import type { Chain } from 'viem'

export const SOMNIA_TESTNET_CHAIN_ID = 50312

export const somniaTestnet = {
  id: SOMNIA_TESTNET_CHAIN_ID,
  name: 'Somnia Testnet',
  nativeCurrency: { name: 'Somnia Test Token', symbol: 'STT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://dream-rpc.somnia.network'] },
  },
  blockExplorers: {
    default: { name: 'Somnia Explorer', url: 'https://explorer.somnia.network' },
  },
  testnet: true,
} as const satisfies Chain

// Somnia Agents platform contract on testnet
export const AGENT_PLATFORM_TESTNET = '0x037Bb9C718F3f7fe5eCBDB0b600D607b52706776' as const

// Agent deposit: 0.03 STT × 3 validators (plus platform floor from getRequestDeposit())
export const PER_AGENT_PRICE = 3n * 10n ** 16n  // 0.03 STT
export const SUBCOMMITTEE_SIZE = 3n

// Scale used throughout LMSR pricing
export const LMSR_SCALE = 10n ** 18n

// Outcome labels for display
export const MATCH_OUTCOME_LABELS: Record<number, string> = {
  1: 'Home',
  2: 'Draw',
  3: 'Away',
}

export const GOAL_OUTCOME_LABELS: Record<number, string> = {
  4: 'Yes',
  5: 'No',
}
