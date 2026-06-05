'use client'

import { useState } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { createWalletClient, custom, parseEther } from 'viem'
import { MatchMarketAbi } from '@final-whistle/sdk'
import { somniaTestnet } from '@/lib/chain'
import { pct, odds, winEstimate, stt } from '@/lib/format'
import type { MatchMarketInfo } from '@final-whistle/sdk'

const OUTCOMES = [
  { label: 'Home wins', index: 0, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/40 hover:bg-green-500/20' },
  { label: 'Draw',      index: 1, color: 'text-zinc-400',  bg: 'bg-zinc-700/20 border-zinc-600/40 hover:bg-zinc-700/30' },
  { label: 'Away wins', index: 2, color: 'text-blue-400',  bg: 'bg-blue-500/10 border-blue-500/40 hover:bg-blue-500/20' },
]

export function BetPanel({ market }: { market: MatchMarketInfo }) {
  const { authenticated, login } = usePrivy()
  const { wallets } = useWallets()
  const [selected, setSelected] = useState<0 | 1 | 2 | null>(null)
  const [amount, setAmount] = useState('0.01')
  const [state, setState] = useState<'idle' | 'confirm' | 'loading' | 'done' | 'error'>('idle')
  const [txHash, setTxHash] = useState<string>()

  const privyWallet = wallets.find(w => w.walletClientType === 'privy')

  async function placeBet() {
    if (selected === null || !privyWallet) return
    setState('loading')
    try {
      const provider = await privyWallet.getEthereumProvider()
      const client = createWalletClient({ chain: somniaTestnet, transport: custom(provider) })
      const value = parseEther(amount)
      const hash = await client.writeContract({
        account: privyWallet.address as `0x${string}`,
        address: market.address,
        abi: MatchMarketAbi,
        functionName: 'bet',
        args: [selected],
        value,
      })
      setTxHash(hash)
      setState('done')
    } catch (err: any) {
      console.error(err)
      setState('error')
      setTimeout(() => setState('idle'), 4000)
    }
  }

  if (state === 'done') {
    return (
      <div className="bg-card border border-green-500/40 rounded-xl p-6 text-center">
        <div className="text-green-400 text-2xl mb-2">⚡</div>
        <div className="font-semibold text-white mb-1">Bet placed.</div>
        <div className="text-sm text-zinc-400">
          You'll be paid automatically when the match settles.
        </div>
        {txHash && (
          <a
            href={`https://explorer.somnia.network/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-green-500 hover:underline mt-3 inline-block"
          >
            View on explorer →
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="text-sm font-semibold text-zinc-300 mb-4">Place a bet</div>

      <div className="flex flex-col gap-2 mb-5">
        {OUTCOMES.map(o => {
          const price = market.prices[o.index]
          const isSelected = selected === o.index
          return (
            <button
              key={o.index}
              onClick={() => { setSelected(o.index as 0|1|2); setState('idle') }}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all
                ${isSelected ? o.bg.replace('hover:', '') + ' ring-1 ring-offset-0' : o.bg}
              `}
            >
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-current' : 'bg-zinc-600'} ${o.color}`} />
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

      {selected !== null && (
        <div className="mb-4">
          <label className="text-xs text-zinc-500 mb-1.5 block">Stake (STT)</label>
          <input
            type="number"
            value={amount}
            min="0.001"
            step="0.001"
            onChange={e => setAmount(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white
              focus:outline-none focus:border-green-500/60"
          />
          <div className="text-xs text-zinc-500 mt-1.5">
            Win estimate:{' '}
            <span className="text-green-400 font-medium">
              {winEstimate(parseEther(amount || '0'), market.prices[selected])}
            </span>
            {' '}if {OUTCOMES[selected].label.toLowerCase()}
          </div>
        </div>
      )}

      {!authenticated ? (
        <button
          onClick={login}
          className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-black font-semibold text-sm rounded-lg transition-colors"
        >
          Sign in to bet
        </button>
      ) : (
        <button
          onClick={placeBet}
          disabled={selected === null || state === 'loading'}
          className="w-full py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed
            text-black font-semibold text-sm rounded-lg transition-colors"
        >
          {state === 'loading' ? 'Placing bet…' : selected !== null ? `Bet ${OUTCOMES[selected].label}` : 'Select an outcome'}
        </button>
      )}

      {state === 'error' && (
        <div className="text-xs text-red-400 mt-2 text-center">Transaction failed. Check your balance.</div>
      )}
    </div>
  )
}
