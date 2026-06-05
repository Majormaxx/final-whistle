'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { createWalletClient, custom, parseEther } from 'viem'
import { MatchMarketAbi, MarketStatus } from '@final-whistle/sdk'
import { somniaTestnet } from '@/lib/chain'
import { odds, pct, winEstimate, kickoffLabel } from '@/lib/format'
import type { MatchMarketInfo } from '@final-whistle/sdk'

type Outcome = 0 | 1 | 2

const OUTCOME_META = [
  { label: 'Home wins', color: 'text-green-400', ring: 'ring-green-500/60', activeBg: 'bg-green-500/20', hoverBg: 'hover:bg-green-500/10' },
  { label: 'Draw',      color: 'text-zinc-300',  ring: 'ring-zinc-500/60',  activeBg: 'bg-zinc-600/30',  hoverBg: 'hover:bg-zinc-700/30' },
  { label: 'Away wins', color: 'text-blue-400',  ring: 'ring-blue-500/60',  activeBg: 'bg-blue-500/20',  hoverBg: 'hover:bg-blue-500/10' },
]

export function MatchRow({ market, isLast }: { market: MatchMarketInfo; isLast: boolean }) {
  const { authenticated, login } = usePrivy()
  const { wallets } = useWallets()
  const [selected, setSelected] = useState<Outcome | null>(null)
  const [amount, setAmount] = useState('0.01')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [txHash, setTxHash] = useState<string>()

  const isOpen = market.status === MarketStatus.Open
  const privyWallet = wallets.find(w => w.walletClientType === 'privy')

  function handleOddsClick(i: Outcome) {
    if (!isOpen) return
    setSelected(prev => (prev === i ? null : i))
    setStatus('idle')
  }

  async function placeBet() {
    if (selected === null || !privyWallet) return
    setStatus('loading')
    try {
      const provider = await privyWallet.getEthereumProvider()
      const client = createWalletClient({ chain: somniaTestnet, transport: custom(provider) })
      const hash = await client.writeContract({
        account: privyWallet.address as `0x${string}`,
        address: market.address,
        abi: MatchMarketAbi,
        functionName: 'bet',
        args: [selected],
        value: parseEther(amount),
      })
      setTxHash(hash)
      setStatus('done')
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3500)
    }
  }

  return (
    <div className={`${!isLast ? 'border-b border-border' : ''}`}>
      {/* Main row */}
      <div className="flex items-center px-4 py-3 gap-3">
        {/* Status */}
        <div className="w-12 shrink-0">
          {isOpen ? (
            <span className="flex items-center gap-1 text-[11px] text-green-500 font-semibold">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              LIVE
            </span>
          ) : market.status === MarketStatus.Resolved ? (
            <span className="text-[11px] text-zinc-500">SETTLED</span>
          ) : (
            <span className="text-[11px] text-zinc-500">CLOSED</span>
          )}
          <div className="text-[10px] text-zinc-600 mt-0.5">{kickoffLabel(market.kickoff)}</div>
        </div>

        {/* Teams */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white truncate">{market.homeTeam}</div>
          <div className="text-sm text-zinc-400 truncate">{market.awayTeam}</div>
        </div>

        {/* Odds buttons */}
        <div className="flex gap-2 shrink-0">
          {([0, 1, 2] as Outcome[]).map(i => {
            const meta = OUTCOME_META[i]
            const price = market.prices[i]
            const isActive = selected === i
            return (
              <button
                key={i}
                onClick={() => handleOddsClick(i)}
                disabled={!isOpen}
                className={`w-14 h-10 rounded-lg border text-center transition-all
                  ${isActive
                    ? `${meta.activeBg} border-current ${meta.ring} ring-1 ${meta.color}`
                    : `bg-zinc-800/60 border-zinc-700/50 ${meta.hoverBg} ${isOpen ? 'cursor-pointer' : 'cursor-default opacity-60'} text-zinc-300`
                  }
                `}
              >
                <div className={`text-sm font-bold ${isActive ? meta.color : ''}`}>{odds(price)}</div>
                <div className="text-[10px] text-zinc-500">{pct(price)}%</div>
              </button>
            )
          })}
        </div>

        {/* Detail link */}
        <Link
          href={`/match/${market.address}`}
          className="shrink-0 text-zinc-600 hover:text-zinc-300 transition-colors pl-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Inline bet panel */}
      {selected !== null && isOpen && (
        <div className="mx-4 mb-3 p-3 rounded-lg bg-zinc-900 border border-zinc-700/60">
          {status === 'done' ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-400 font-medium">⚡ Bet placed. You'll be paid when it settles.</span>
              {txHash && (
                <a
                  href={`https://explorer.somnia.network/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-500 hover:underline"
                >
                  View →
                </a>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className={`text-sm font-medium ${OUTCOME_META[selected].color} shrink-0`}>
                {OUTCOME_META[selected].label} · {odds(market.prices[selected])}
              </div>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="number"
                  value={amount}
                  min="0.001"
                  step="0.001"
                  onChange={e => setAmount(e.target.value)}
                  className="w-24 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-white
                    focus:outline-none focus:border-green-500/60"
                  placeholder="STT"
                />
                <span className="text-xs text-zinc-500 shrink-0">
                  Win: <span className="text-green-400 font-medium">
                    {winEstimate(parseEther(amount || '0'), market.prices[selected])}
                  </span>
                </span>
              </div>
              {!authenticated ? (
                <button
                  onClick={login}
                  className="shrink-0 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-black text-sm font-semibold rounded-lg transition-colors"
                >
                  Sign in
                </button>
              ) : (
                <button
                  onClick={placeBet}
                  disabled={status === 'loading'}
                  className="shrink-0 px-3 py-1.5 bg-green-500 hover:bg-green-600 disabled:opacity-50
                    text-black text-sm font-semibold rounded-lg transition-colors"
                >
                  {status === 'loading' ? '…' : 'Bet'}
                </button>
              )}
              {status === 'error' && (
                <span className="text-xs text-red-400 shrink-0">Failed</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
