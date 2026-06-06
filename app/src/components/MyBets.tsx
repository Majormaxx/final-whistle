'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { createPublicClient, http } from 'viem'
import { MarketStatus, MatchMarketAbi } from '@final-whistle/sdk'
import { somniaTestnet } from '@/lib/chain'
import { loadBets } from '@/lib/bets'
import type { StoredBet } from '@/lib/bets'

const OUTCOME_LABEL = ['Home wins', 'Draw', 'Away wins']
const OUTCOME_COLOR = ['text-green-400', 'text-zinc-300', 'text-blue-400']

type BetWithStatus = StoredBet & {
  result: 'pending' | 'won' | 'lost' | 'unknown'
}

const pub = createPublicClient({ chain: somniaTestnet, transport: http() })

async function resolveStatus(bet: StoredBet): Promise<BetWithStatus['result']> {
  try {
    const [status, result] = await Promise.all([
      pub.readContract({ address: bet.marketAddress as `0x${string}`, abi: MatchMarketAbi, functionName: 'status' }),
      pub.readContract({ address: bet.marketAddress as `0x${string}`, abi: MatchMarketAbi, functionName: 'result' }),
    ])
    if (Number(status) !== MarketStatus.Resolved) return 'pending'
    return Number(result) === bet.outcome ? 'won' : 'lost'
  } catch {
    return 'unknown'
  }
}

export function MyBets() {
  const { authenticated } = usePrivy()
  const [bets, setBets] = useState<BetWithStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authenticated) { setLoading(false); return }
    const raw = loadBets()
    if (raw.length === 0) { setLoading(false); return }

    Promise.all(raw.map(async b => ({
      ...b,
      result: await resolveStatus(b),
    }))).then(resolved => {
      setBets(resolved)
      setLoading(false)
    })
  }, [authenticated])

  if (!authenticated || (bets.length === 0 && !loading)) return null

  return (
    <div className="mt-8">
      <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-widest">My Bets</h2>

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map(i => (
            <div key={i} className="h-14 rounded-xl bg-zinc-900 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          {bets.map((bet, i) => (
            <div
              key={bet.txHash}
              className={`flex items-center gap-3 px-4 py-3 ${i < bets.length - 1 ? 'border-b border-border' : ''}`}
            >
              {/* Result chip */}
              <div
                title={bet.result === 'unknown' ? 'Could not read market status — RPC may be temporarily unavailable' : undefined}
                className={`shrink-0 w-14 text-center py-1 rounded text-xs font-bold
                  ${bet.result === 'won'     ? 'bg-green-500/20 text-green-400' :
                    bet.result === 'lost'    ? 'bg-zinc-800 text-zinc-500' :
                    bet.result === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                                               'bg-zinc-800 text-zinc-700'}
                `}>
                {bet.result === 'won' ? 'WON' : bet.result === 'lost' ? 'LOST' : bet.result === 'pending' ? 'OPEN' : '—'}
              </div>

              {/* Match + outcome */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-zinc-200 truncate">
                  {bet.homeTeam} vs {bet.awayTeam}
                </div>
                <div className={`text-xs ${OUTCOME_COLOR[bet.outcome]}`}>
                  {OUTCOME_LABEL[bet.outcome]} · {bet.amount} STT
                </div>
              </div>

              {/* League + time */}
              <div className="text-right shrink-0">
                <div className="text-[11px] text-zinc-600">{bet.league}</div>
                <div className="text-[10px] text-zinc-700">
                  {new Date(bet.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </div>
              </div>

              {/* Explorer link */}
              <a
                href={`https://explorer.somnia.network/tx/${bet.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-zinc-700 hover:text-zinc-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
