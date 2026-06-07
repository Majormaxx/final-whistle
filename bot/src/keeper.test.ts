import { test } from 'node:test'
import assert from 'node:assert/strict'
import { encodeEventTopics, encodeAbiParameters, parseAbiItem, type Log } from 'viem'
import { MatchMarketAbi } from '@final-whistle/sdk'
import { extractPayoutAmount } from './keeper.js'

const PAYOUT_SENT  = parseAbiItem('event PayoutSent(address indexed bettor, uint256 amount)')
const OTHER_EVENT  = parseAbiItem('event BetPlaced(address indexed bettor, uint8 outcome, uint256 amount, uint256 shares)')
const BETTOR       = '0x4e36ee389458856E79945a07Bf1bE36261E7b6a2' as const
const SOMEONE_ELSE = '0x000000000000000000000000000000000000dEaD' as const
const MARKET       = '0x23135130e9320e11c1e96e1f422b16e32e4474f0' as const

const BASE_LOG = {
  address:          MARKET,
  blockHash:        `0x${'11'.repeat(32)}` as const,
  blockNumber:      1n,
  transactionHash:  `0x${'22'.repeat(32)}` as const,
  transactionIndex: 0,
  logIndex:         0,
  removed:          false,
} satisfies Partial<Log>

function payoutLog(bettor: `0x${string}`, amount: bigint): Log {
  return {
    ...BASE_LOG,
    topics: encodeEventTopics({ abi: [PAYOUT_SENT], eventName: 'PayoutSent', args: { bettor } }),
    data:   encodeAbiParameters([{ name: 'amount', type: 'uint256' }], [amount]),
  }
}

function unrelatedLog(): Log {
  return {
    ...BASE_LOG,
    topics: encodeEventTopics({
      abi: [OTHER_EVENT], eventName: 'BetPlaced', args: { bettor: BETTOR, outcome: 0 },
    }),
    data: encodeAbiParameters(
      [{ name: 'amount', type: 'uint256' }, { name: 'shares', type: 'uint256' }],
      [1_000_000n, 2_000_000n],
    ),
  }
}

test('extractPayoutAmount reads the amount off a real claim() receipt', () => {
  const logs = [payoutLog(BETTOR, 50_000_000_000_000_000n)]
  assert.equal(extractPayoutAmount(MatchMarketAbi, logs), 50_000_000_000_000_000n)
})

test('extractPayoutAmount returns null for a "nothing to claim" receipt', () => {
  assert.equal(extractPayoutAmount(MatchMarketAbi, []), null)
})

test('extractPayoutAmount ignores other event types in the same receipt', () => {
  const logs = [unrelatedLog(), payoutLog(BETTOR, 7n)]
  assert.equal(extractPayoutAmount(MatchMarketAbi, logs), 7n)
})

test('extractPayoutAmount decodes regardless of which bettor the log names', () => {
  // claim() always emits for msg.sender, but the decoder itself doesn't (and
  // shouldn't) assume that — it just reports what the receipt says happened.
  const logs = [payoutLog(SOMEONE_ELSE, 123n)]
  assert.equal(extractPayoutAmount(MatchMarketAbi, logs), 123n)
})

test('extractPayoutAmount works against the NextGoalMarket ABI shape too', async () => {
  const { NextGoalMarketAbi } = await import('@final-whistle/sdk')
  const logs = [payoutLog(BETTOR, 999n)]
  assert.equal(extractPayoutAmount(NextGoalMarketAbi, logs), 999n)
})
