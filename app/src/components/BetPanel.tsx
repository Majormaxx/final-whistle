'use client'

import { useState } from 'react'
import { Loader2, Zap } from 'lucide-react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { createWalletClient, custom, parseEther } from 'viem'
import { MatchMarketAbi } from '@final-whistle/sdk'
import { somniaTestnet } from '@/lib/chain'
import { pct, odds, winEstimate } from '@/lib/format'
import { saveBet } from '@/lib/bets'
import { classifyBetError, BET_ERROR_MSG } from '@/lib/bet-error'
import { useToast } from '@/lib/toast-context'
import type { MatchMarketInfo } from '@final-whistle/sdk'

const OUTCOMES = [
  { label: 'Home wins', index: 0, color: 'text-green-400', activeBg: 'bg-green-500/20 border-green-500', hoverBg: 'hover:bg-green-500/10 border-zinc-800' },
  { label: 'Draw',      index: 1, color: 'text-zinc-300',  activeBg: 'bg-zinc-600/30 border-zinc-500',   hoverBg: 'hover:bg-zinc-700/30 border-zinc-800' },
  { label: 'Away wins', index: 2, color: 'text-blue-400',  activeBg: 'bg-blue-500/20 border-blue-500',   hoverBg: 'hover:bg-blue-500/10 border-zinc-800' },
]

const PRESETS = ['0.01', '0.05', '0.1', '0.25']

export function BetPanel({ market }: { market: MatchMarketInfo }) {
  const { authenticated, login } = usePrivy()
  const { wallets } = useWallets()
  const toast = useToast()
  const [selected, setSelected] = useState<0 | 1 | 2 | null>(null)
  const [amount, setAmount] = useState('0.01')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string>()

  const privyWallet = wallets.find(w => w.walletClientType === 'privy')

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
        abi: MatchMarketAbi,
        functionName: 'bet',
        args: [selected],
        value: parseEther(amount),
      })
      setTxHash(hash)
      setStatus('done')
      saveBet({
        txHash: hash,
        marketAddress: market.address,
        marketType: 'match',
        homeTeam: market.homeTeam,
        awayTeam: market.awayTeam,
        league: 'Friendlies',
        outcome: selected,
        amount,
        timestamp: Date.now(),
      })
      toast.push({ kind: 'success', message: `Bet's down — ${market.homeTeam} vs ${market.awayTeam}. Sit back.`, txHash: hash })
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

  if (status === 'done') {
    return (
      <div className="bg-card border border-green-500/30 rounded-xl p-6 text-center">
        <div className="flex justify-center mb-2">
          <Zap className="w-6 h-6 text-green-400" strokeWidth={2} />
        </div>
        <div className="font-semibold text-white mb-1">You're in.</div>
        <div className="text-sm text-zinc-400">Payout lands the second the final whistle blows.</div>
        {txHash && (
          <a href={`https://explorer.somnia.network/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors mt-3 inline-block">
            View on explorer →
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="text-sm font-semibold text-zinc-300 mb-4">Place a bet</div>

      {/* Outcome selection */}
      <div className="flex flex-col gap-2 mb-5">
        {OUTCOMES.map(o => {
          const price = market.prices[o.index]
          const isSelected = selected === o.index
          return (
            <button
              key={o.index}
              onClick={() => { setSelected(o.index as 0|1|2); setStatus('idle'); setErrorMsg(null) }}
              aria-label={`${o.label}, odds ${odds(price)}`}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all
                ${isSelected ? o.activeBg : o.hoverBg}`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-current' : 'bg-zinc-700'} ${o.color}`} />
                <span className="text-sm font-medium text-white">{o.label}</span>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold ${o.color}`}>{odds(price)}</div>
                <div className="text-[11px] text-zinc-500">{pct(price)}%</div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Stake input + presets */}
      {selected !== null && (
        <div className="mb-4">
          <div className="flex gap-1.5 mb-2">
            {PRESETS.map(p => (
              <button key={p} onClick={() => setAmount(p)}
                className={`flex-1 py-1 text-xs rounded border transition-colors
                  ${amount === p
                    ? 'border-green-500/60 bg-green-500/10 text-green-400'
                    : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                  }`}>
                {p}
              </button>
            ))}
          </div>
          <input
            type="number" value={amount} min="0.001" step="0.001"
            onChange={e => setAmount(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white
              focus:outline-none focus:border-green-500/60"
            placeholder="STT amount"
          />
          <div className="text-[11px] text-zinc-500 mt-1.5">
            Win estimate:{' '}
            <span className="text-green-400 font-medium">
              {winEstimate(parseEther(amount || '0'), market.prices[selected])}
            </span>
            {' '}if {OUTCOMES[selected].label.toLowerCase()}
          </div>
        </div>
      )}

      {/* Action button */}
      {!authenticated ? (
        <button onClick={login}
          className="w-full py-2.5 bg-green-500 hover:bg-green-400 text-black font-bold text-sm rounded-lg transition-colors">
          Sign in to bet
        </button>
      ) : (
        <button onClick={placeBet} disabled={selected === null || status === 'loading'}
          className="w-full py-2.5 bg-green-500 hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed
            text-black font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2">
          {status === 'loading' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Placing bet…
            </>
          ) : selected !== null ? `Bet ${amount} STT on ${OUTCOMES[selected].label}` : 'Select an outcome'}
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
