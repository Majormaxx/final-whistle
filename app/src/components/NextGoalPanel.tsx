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
import { useToast } from '@/lib/toast-context'
import type { NextGoalMarketInfo } from '@final-whistle/sdk'

const PRESETS = ['0.005', '0.01', '0.05']

export function NextGoalPanel({ market }: { market: NextGoalMarketInfo }) {
  const { authenticated, login } = usePrivy()
  const { wallets } = useWallets()
  const toast = useToast()
  const [selected, setSelected] = useState<0 | 1 | null>(null)
  const [amount, setAmount] = useState(PRESETS[0])
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
        value: parseEther(amount),
      })
      setStatus('done')
      saveBet({
        txHash: hash,
        marketAddress: market.address,
        marketType: 'nextGoal',
        homeTeam: 'Next goal',
        awayTeam: 'window',
        league: 'In-play',
        outcome: selected,
        amount,
        timestamp: Date.now(),
      })
      toast.push({ kind: 'success', message: "You're in — next goal settles it, automatically", txHash: hash })
    } catch (err) {
      const kind = classifyBetError(err)
      if (kind === 'rejected') {
        setStatus('idle')
        return
      }
      setErrorMsg(BET_ERROR_MSG[kind])
      setStatus('error')
      toast.push({ kind: 'error', message: BET_ERROR_MSG[kind] })
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
          You're in — next goal settles it, automatically
        </div>
      ) : !authenticated ? (
        <button onClick={login} className="w-full py-2 bg-green-500 hover:bg-green-400 text-black font-bold text-sm rounded-lg transition-colors">
          Sign in to bet
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          {selected !== null && (
            <div className="flex gap-1.5">
              {PRESETS.map(p => (
                <button
                  key={p}
                  onClick={() => setAmount(p)}
                  className={`flex-1 py-1 text-xs rounded border transition-colors
                    ${amount === p
                      ? 'border-green-500/60 bg-green-500/10 text-green-400'
                      : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                    }`}
                >
                  {p}
                </button>
              ))}
              <input
                type="number"
                value={amount}
                min="0.001"
                step="0.001"
                onChange={e => setAmount(e.target.value)}
                className="w-20 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white
                  focus:outline-none focus:border-green-500/60 text-center"
                placeholder="STT"
              />
            </div>
          )}
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
            ) : `Bet ${amount} STT`}
          </button>
        </div>
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
