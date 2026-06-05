import { readClient } from '@/lib/sdk'
import { BetPanel } from '@/components/BetPanel'
import { NextGoalPanel } from '@/components/NextGoalPanel'
import { pct, stt, kickoffLabel } from '@/lib/format'
import { MarketStatus, Outcome } from '@final-whistle/sdk'
import type { Address } from 'viem'

export const revalidate = 5

const RESULT_LABEL: Record<number, string> = {
  [Outcome.Home]: 'Home won',
  [Outcome.Draw]: 'Draw',
  [Outcome.Away]: 'Away won',
}

export default async function MatchPage({ params }: { params: Promise<{ address: string }> }) {
  const { address: rawAddress } = await params
  const address = rawAddress as Address
  const market = await readClient.getMatchMarket(address)

  const nextGoalAddresses = await readClient.getNextGoalMarkets(market.marketId)
  const nextGoalMarkets = await Promise.all(
    nextGoalAddresses.map(a => readClient.getNextGoalMarket(a))
  )
  const openWindows = nextGoalMarkets.filter(m => m.status === MarketStatus.Open)

  const [p0, p1, p2] = market.prices.map(pct)
  const isOpen = market.status === MarketStatus.Open
  const isResolved = market.status === MarketStatus.Resolved

  return (
    <div>
      {/* Match header */}
      <div className="bg-card border border-border rounded-xl p-6 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-zinc-500">
            World Cup Qualification · {kickoffLabel(market.kickoff)}
          </span>
          {isOpen && (
            <span className="flex items-center gap-1 text-xs text-green-500">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Live
            </span>
          )}
          {isResolved && (
            <span className="text-xs text-zinc-400">
              Settled · {RESULT_LABEL[market.result] ?? '—'}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-center flex-1">
            <div className="text-xl font-bold text-white">{market.homeTeam}</div>
          </div>
          <div className="text-zinc-600 font-light text-lg px-6">vs</div>
          <div className="text-center flex-1">
            <div className="text-xl font-bold text-white">{market.awayTeam}</div>
          </div>
        </div>

        {/* Odds bar */}
        <div className="mt-6">
          <div className="flex rounded-lg overflow-hidden h-9 text-sm font-semibold">
            <div className="flex items-center justify-center bg-green-500/20 text-green-400"
              style={{ width: `${p0}%` }}>
              {p0 >= 15 ? `${p0}%` : ''}
            </div>
            <div className="flex items-center justify-center bg-zinc-700/30 text-zinc-400"
              style={{ width: `${p1}%` }}>
              {p1 >= 15 ? `${p1}%` : ''}
            </div>
            <div className="flex items-center justify-center bg-blue-500/20 text-blue-400"
              style={{ width: `${p2}%` }}>
              {p2 >= 15 ? `${p2}%` : ''}
            </div>
          </div>
          <div className="flex justify-between text-xs text-zinc-500 mt-1.5 px-0.5">
            <span>Home {p0}%</span>
            <span>Draw {p1}%</span>
            <span>Away {p2}%</span>
          </div>
        </div>

        {/* Pool */}
        <div className="mt-4 pt-4 border-t border-border flex justify-between text-xs text-zinc-500">
          <span>Pool</span>
          <span className="text-zinc-300">{stt(market.pool)}</span>
        </div>
      </div>

      {/* Bet panels */}
      <div className="flex flex-col gap-3">
        {isOpen && <BetPanel market={market} />}

        {openWindows.map(w => (
          <NextGoalPanel key={w.address} market={w} />
        ))}

        {isResolved && (
          <div className="bg-card border border-green-500/30 rounded-xl p-6 text-center">
            <div className="text-green-400 font-semibold mb-1">
              {RESULT_LABEL[market.result] ?? 'Settled'}
            </div>
            <div className="text-sm text-zinc-400">
              Resolved by Somnia Agents · {stt(market.pool)} distributed
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
