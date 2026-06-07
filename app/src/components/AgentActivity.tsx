'use client'

import { useEffect, useRef, useState } from 'react'
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
    }

    ;[...initialWindows]
      .sort((a, b) => Number(a.windowStart - b.windowStart))
      .forEach((w, i) => watchWindow(w.address, `Window ${i + 1}`))

    unsubs.push(
      readClient.watchResolutionInitiated((e) => {
        if (!tracked.has(e.market.toLowerCase() as Address)) return
        const isMatch = e.market.toLowerCase() === matchAddress.toLowerCase()
        push({
          id: `${e.log.transactionHash}-${e.log.logIndex}`,
          text: `${isMatch ? 'Full-time score' : 'Goal-window score'} requested from agent`,
          detail: 'Reading the live feed now — result incoming',
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
      readClient.watchNextGoalMarketCreated((e) => {
        if (e.parentMatchId.toLowerCase() !== parentMatchId.toLowerCase()) return
        windowCount += 1
        watchWindow(e.market, `Window ${windowCount}`)
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
