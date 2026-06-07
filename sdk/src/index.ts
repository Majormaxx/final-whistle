// Client
export { FinalWhistleClient } from './client.js'

// Types
export {
  MarketStatus,
  Outcome,
  type FinalWhistleConfig,
  type MatchMarketInfo,
  type NextGoalMarketInfo,
  type MatchMarketCreatedEvent,
  type NextGoalMarketCreatedEvent,
  type BetPlacedEvent,
  type MarketResolvedEvent,
  type ResolutionInitiatedEvent,
  type PayoutSentEvent,
  type BetEstimate,
} from './types.js'

// ABIs
export { MarketFactoryAbi } from './abis/MarketFactory.js'
export { MatchMarketAbi }   from './abis/MatchMarket.js'
export { NextGoalMarketAbi } from './abis/NextGoalMarket.js'
export { ResolverAgentAbi } from './abis/ResolverAgent.js'

// Constants
export {
  somniaTestnet,
  SOMNIA_TESTNET_CHAIN_ID,
  AGENT_PLATFORM_TESTNET,
  PER_AGENT_PRICE,
  SUBCOMMITTEE_SIZE,
  LMSR_SCALE,
  MATCH_OUTCOME_LABELS,
  GOAL_OUTCOME_LABELS,
} from './constants.js'

// Agent payload encoding
export {
  encodeFetchUint,
  encodeFetchString,
  encodeFetchBool,
  buildGoalPayloads,
} from './agents.js'
