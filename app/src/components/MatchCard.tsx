'use client'

import Link from 'next/link'
import { pct, kickoffLabel } from '@/lib/format'
import { MarketStatus } from '@final-whistle/sdk'
import type { MatchMarketInfo } from '@final-whistle/sdk'

const STATUS_LABEL: Record<number, string> = {
  [MarketStatus.Open]:     'LIVE',
  [MarketStatus.Closed]:   'CLOSED',
  [MarketStatus.Resolved]: 'SETTLED',
}

export function MatchCard({ market }: { market: MatchMarketInfo }) {
  const [p0, p1, p2] = market.prices.map(pct)
  const isLive = market.status === MarketStatus.Open

  return (
    <Link
      href={`/match/${market.address}`}
      className="block bg-card border border-border rounded-xl p-5 hover:border-green-500/40 transition-colors"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-center flex-1">
          <div className="font-semibold text-white">{market.homeTeam}</div>
          <div className="text-xs text-zinc-500 mt-0.5">Home</div>
        </div>
        <div className="px-4 text-center">
          <div className="text-xs text-zinc-500">{kickoffLabel(market.kickoff)}</div>
          {isLive && (
            <div className="flex items-center gap-1 mt-1 justify-center">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-500 font-medium">LIVE</span>
            </div>
          )}
          {!isLive && (
            <div className="text-xs text-zinc-500 mt-1">
              {STATUS_LABEL[market.status] ?? '—'}
            </div>
          )}
        </div>
        <div className="text-center flex-1">
          <div className="font-semibold text-white">{market.awayTeam}</div>
          <div className="text-xs text-zinc-500 mt-0.5">Away</div>
        </div>
      </div>

      {/* Odds bar */}
      <div className="flex rounded-lg overflow-hidden h-8 text-xs font-medium">
        <div
          className="flex items-center justify-center bg-green-500/20 text-green-400 transition-all"
          style={{ width: `${p0}%` }}
        >
          {p0 >= 15 ? `${p0}%` : ''}
        </div>
        <div
          className="flex items-center justify-center bg-zinc-700/40 text-zinc-400 transition-all"
          style={{ width: `${p1}%` }}
        >
          {p1 >= 15 ? `${p1}%` : ''}
        </div>
        <div
          className="flex items-center justify-center bg-blue-500/20 text-blue-400 transition-all"
          style={{ width: `${p2}%` }}
        >
          {p2 >= 15 ? `${p2}%` : ''}
        </div>
      </div>
      <div className="flex justify-between text-[11px] text-zinc-500 mt-1 px-0.5">
        <span>Home {p0}%</span>
        <span>Draw {p1}%</span>
        <span>Away {p2}%</span>
      </div>
    </Link>
  )
}
