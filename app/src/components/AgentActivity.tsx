'use client'

import { useEffect, useState } from 'react'
import { Activity } from 'lucide-react'
import { readClient } from '@/lib/sdk'
import { MatchMarketAbi, NextGoalMarketAbi, Outcome } from '@final-whistle/sdk'
import { stt, shortAddr } from '@/lib/format'
import type { Address, Hash } from 'viem'
import type { NextGoalMarketInfo } from '@final-whistle/sdk'

type FeedEntry = {
  id: string
  text: string
  detail: string
  hash: Hash
}

const RESULT_LABEL: Record<number, string> = {
  [Outcome.Home]: 'Home win',
  [Outcome.Draw]: 'Draw',
  [Outcome.Away]: 'Away win',
  [Outcome.Yes]: 'Goal scored',
  [Outcome.No]: 'No goal',
}

// BetPlaced.outcome is a raw contract index (0/1/2 and 0/1), NOT the Outcome
// enum above — these mirror the label arrays already used in BetPanel /
// NextGoalPanel so a "1" reads as "Draw" here exactly like it does there.
const MATCH_BET_LABEL = ['Home win', 'Draw', 'Away win']
const GOAL_BET_LABEL = ['Yes', 'No']

const MAX_ENTRIES = 12

// Live, on-chain narration of the resolver doing its job — only meaningful
// while the match is in play, since every event here already has a permanent
// home in MarketTimeline once the match (and this feed) goes quiet.
export function AgentActivity({
  matchAddress,
  parentMatchId,
  initialWindows,
}: {
  matchAddress: Address
  parentMatchId: Hash
  initialWindows: NextGoalMarketInfo[]
}) {
  const [feed, setFeed] = useState<FeedEntry[]>([])

  useEffect(() => {
    const tracked = new Set<Address>([matchAddress.toLowerCase() as Address])
    let windowCount = initialWindows.length
    const unsubs: (() => void)[] = []
    // ResolutionFailed only carries a requestId, not a market address — the
    // resolver itself correlates the two via its ResolutionJob bookkeeping,
    // so we mirror that here from the ResolutionInitiated stream to know
    // whether a failure belongs to a market we're tracking.
    const reqIdToMarket = new Map<bigint, Address>()

    function push(entry: FeedEntry) {
      setFeed(prev => (prev.some(e => e.id === entry.id) ? prev : [entry, ...prev].slice(0, MAX_ENTRIES)))
    }

    function watchWindow(address: Address, label: string) {
      tracked.add(address.toLowerCase() as Address)
      unsubs.push(
        readClient.watchMarketResolved(address, NextGoalMarketAbi, (e) => {
          push({
            id: `${e.log.transactionHash}-${e.log.logIndex}`,
            text: `${label} resolved — ${RESULT_LABEL[e.result] ?? 'settled'}`,
            detail: 'Final score confirmed — straight from the source',
            hash: e.log.transactionHash as Hash,
          })
        }),
      )
      unsubs.push(
        readClient.watchBetsPlaced(address, NextGoalMarketAbi, (e) => {
          push({
            id: `${e.log.transactionHash}-${e.log.logIndex}`,
            text: `${stt(e.cost, 3)} on ${GOAL_BET_LABEL[e.outcome] ?? 'a side'} — ${label}`,
            detail: `${shortAddr(e.bettor)} just staked it — odds just moved`,
            hash: e.log.transactionHash as Hash,
          })
        }),
      )
    }

    ;[...initialWindows]
      .sort((a, b) => Number(a.windowStart - b.windowStart))
      .forEach((w, i) => watchWindow(w.address, `Window ${i + 1}`))

    unsubs.push(
      readClient.watchResolutionInitiated((e) => {
        const market = e.market.toLowerCase() as Address
        reqIdToMarket.set(e.homeReqId, market)
        reqIdToMarket.set(e.awayReqId, market)
        if (!tracked.has(market)) return
        const isMatch = market === matchAddress.toLowerCase()
        push({
          id: `${e.log.transactionHash}-${e.log.logIndex}`,
          text: `${isMatch ? 'Full-time score' : 'Goal-window score'} requested from agent`,
          detail: 'Reading the live feed now — result incoming',
          hash: e.log.transactionHash as Hash,
        })
      }),
    )

    unsubs.push(
      readClient.watchResolutionFailed((e) => {
        const market = reqIdToMarket.get(e.requestId)
        if (!market || !tracked.has(market)) return
        push({
          id: `${e.log.transactionHash}-${e.log.logIndex}`,
          text: 'Agent response came back unclear — escalating to the safety net',
          detail: 'Funds stay put — a 2-of-3 multisig steps in next',
          hash: e.log.transactionHash as Hash,
        })
      }),
    )

    unsubs.push(
      readClient.watchEmergencyResolved((e) => {
        if (!tracked.has(e.market.toLowerCase() as Address)) return
        push({
          id: `${e.log.transactionHash}-${e.log.logIndex}`,
          text: `Resolved by emergency multisig — ${RESULT_LABEL[e.result] ?? 'settled'}`,
          detail: 'Funds were never at risk — a human-backed safety net stepped in',
          hash: e.log.transactionHash as Hash,
        })
      }),
    )

    unsubs.push(
      readClient.watchMarketResolved(matchAddress, MatchMarketAbi, (e) => {
        push({
          id: `${e.log.transactionHash}-${e.log.logIndex}`,
          text: `Match resolved — ${RESULT_LABEL[e.result] ?? 'settled'}`,
          detail: 'Final whistle confirmed on-chain — payouts unlocked',
          hash: e.log.transactionHash as Hash,
        })
      }),
    )

    unsubs.push(
      readClient.watchPayoutSent(matchAddress, MatchMarketAbi, (e) => {
        push({
          id: `${e.log.transactionHash}-${e.log.logIndex}`,
          text: `Paid ${stt(e.amount, 4)} to ${shortAddr(e.bettor)}`,
          detail: "Money's already moving — nothing for you to do",
          hash: e.log.transactionHash as Hash,
        })
      }),
    )

    unsubs.push(
      readClient.watchBetsPlaced(matchAddress, MatchMarketAbi, (e) => {
        push({
          id: `${e.log.transactionHash}-${e.log.logIndex}`,
          text: `${stt(e.cost, 3)} on ${MATCH_BET_LABEL[e.outcome] ?? 'a side'}`,
          detail: `${shortAddr(e.bettor)} just staked it — odds just moved`,
          hash: e.log.transactionHash as Hash,
        })
      }),
    )

    unsubs.push(
      readClient.watchNextGoalMarketCreated((e) => {
        if (e.parentMatchId.toLowerCase() !== parentMatchId.toLowerCase()) return
        windowCount += 1
        watchWindow(e.market, `Window ${windowCount}`)
      }),
    )

    unsubs.push(
      readClient.watchMatchMarketCreated((e) => {
        push({
          id: `${e.log.transactionHash}-${e.log.logIndex}`,
          text: `New match market opened — ${e.homeTeam} vs ${e.awayTeam}`,
          detail: 'Markets open the moment the fixture goes live',
          hash: e.log.transactionHash as Hash,
        })
      }),
    )

    return () => unsubs.forEach(u => u())
    // initialWindows is a snapshot used only to seed subscriptions on mount —
    // re-subscribing every time it changes would tear down and lose history.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchAddress, parentMatchId])

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2">
        <Activity className="w-3.5 h-3.5 text-green-400" strokeWidth={2} />
        <span className="text-sm font-semibold text-zinc-300">Live action</span>
        <span className="flex items-center gap-1 text-[11px] text-green-500 ml-auto">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          Live
        </span>
      </div>

      {feed.length === 0 ? (
        <div className="text-xs text-zinc-600 mt-3">
          Every score, every payout — the second it hits the chain.
        </div>
      ) : (
        <div className="mt-3 space-y-2.5">
          {feed.map(e => (
            <div key={e.id} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm text-zinc-200 truncate">{e.text}</div>
                <div className="text-[11px] text-zinc-600 truncate">{e.detail}</div>
              </div>
              <a
                href={`https://explorer.somnia.network/tx/${e.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-[11px] text-zinc-600 hover:text-zinc-300 transition-colors mt-0.5"
              >
                View →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
