'use client'

import { useState } from 'react'
import { Loader2, Zap } from 'lucide-react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { createWalletClient, custom, parseEther } from 'viem'
import { NextGoalMarketAbi, MarketStatus } from '@final-whistle/sdk'
import { somniaTestnet } from '@/lib/chain'
import { pct, odds } from '@/lib/format'
import { saveBet } from '@/lib/bets'
import { classifyBetError, BET_ERROR_MSG } from '@/lib/bet-error'
import type { NextGoalMarketInfo } from '@final-whistle/sdk'

const BET_AMOUNT = '0.005'

export function NextGoalPanel({ market }: { market: NextGoalMarketInfo }) {
  const { authenticated, login } = usePrivy()
  const { wallets } = useWallets()
  const [selected, setSelected] = useState<0 | 1 | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const privyWallet = wallets.find(w => w.walletClientType === 'privy')
  const isOpen = market.status === MarketStatus.Open

  const windowEnd = new Date(Number(market.windowEnd) * 1000)
  const msLeft = windowEnd.getTime() - Date.now()
  const minLeft = Math.max(0, Math.floor(msLeft / 60000))

  async function placeBet() {
    if (selected === null || !privyWallet) return
    setStatus('loading')
    setErrorMsg(null)
    try {
      const provider = await privyWallet.getEthereumProvider()
      const client = createWalletClient({ chain: somniaTestnet, transport: custom(provider) })
      const hash = await client.writeContract({
        account: privyWallet.address as `0x${string}`,
        address: market.address,
        abi: NextGoalMarketAbi,
        functionName: 'bet',
        args: [selected],
        value: parseEther(BET_AMOUNT),
      })
      setStatus('done')
      saveBet({
        txHash: hash,
        marketAddress: market.address,
        homeTeam: 'Next goal',
        awayTeam: 'window',
        league: 'In-play',
        outcome: selected,
        amount: BET_AMOUNT,
        timestamp: Date.now(),
      })
    } catch (err) {
      const kind = classifyBetError(err)
      if (kind === 'rejected') {
        setStatus('idle')
        return
      }
      setErrorMsg(BET_ERROR_MSG[kind])
      setStatus('error')
    }
  }

  if (!isOpen) return null

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0" />
          <span className="text-sm font-semibold text-zinc-300">Next goal?</span>
        </div>
        <span className="text-[11px] text-zinc-500">Locks in {minLeft}m</span>
      </div>

      <div className="flex gap-2 mb-4">
        {[{ label: 'Yes', index: 0 as const }, { label: 'No', index: 1 as const }].map(o => {
          const price = market.prices[o.index]
          const isSelected = selected === o.index
          return (
            <button
              key={o.index}
              onClick={() => { setSelected(o.index); setStatus('idle'); setErrorMsg(null) }}
              className={`flex-1 py-3 rounded-lg border text-sm font-semibold transition-all
                ${isSelected
                  ? 'bg-green-500/20 border-green-500 text-green-400'
                  : 'bg-surface border-zinc-800 text-zinc-400 hover:border-zinc-600'}
              `}
            >
              <div>{o.label}</div>
              <div className="text-[11px] font-normal mt-0.5 opacity-70">
                {pct(price)}% · {odds(price)}
              </div>
            </button>
          )
        })}
      </div>

      {status === 'done' ? (
        <div className="flex items-center justify-center gap-1.5 py-2 text-sm text-green-400">
          <Zap className="w-3.5 h-3.5" strokeWidth={2.5} />
          Bet placed — auto-settled on next goal
        </div>
      ) : !authenticated ? (
        <button onClick={login} className="w-full py-2 bg-green-500 hover:bg-green-400 text-black font-bold text-sm rounded-lg transition-colors">
          Sign in to bet
        </button>
      ) : (
        <button
          onClick={placeBet}
          disabled={selected === null || status === 'loading'}
          className="w-full py-2 bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Placing…
            </>
          ) : `Bet ${BET_AMOUNT} STT`}
        </button>
      )}

      {status === 'error' && errorMsg && (
        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-xs text-red-400">{errorMsg}</span>
          <button
            onClick={() => { setStatus('idle'); setErrorMsg(null) }}
            className="text-xs text-zinc-500 hover:text-zinc-300 underline transition-colors ml-3 shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}
