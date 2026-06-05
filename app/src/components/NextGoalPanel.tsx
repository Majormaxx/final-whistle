'use client'

import { useState } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { createWalletClient, custom, parseEther } from 'viem'
import { NextGoalMarketAbi, MarketStatus } from '@final-whistle/sdk'
import { somniaTestnet } from '@/lib/chain'
import { pct, odds, winEstimate } from '@/lib/format'
import type { NextGoalMarketInfo } from '@final-whistle/sdk'

export function NextGoalPanel({ market }: { market: NextGoalMarketInfo }) {
  const { authenticated, login } = usePrivy()
  const { wallets } = useWallets()
  const [selected, setSelected] = useState<0 | 1 | null>(null)
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const privyWallet = wallets.find(w => w.walletClientType === 'privy')
  const isOpen = market.status === MarketStatus.Open

  const windowEnd = new Date(Number(market.windowEnd) * 1000)
  const now = new Date()
  const msLeft = windowEnd.getTime() - now.getTime()
  const minLeft = Math.max(0, Math.floor(msLeft / 60000))

  async function placeBet() {
    if (selected === null || !privyWallet) return
    setState('loading')
    try {
      const provider = await privyWallet.getEthereumProvider()
      const client = createWalletClient({ chain: somniaTestnet, transport: custom(provider) })
      await client.writeContract({
        account: privyWallet.address as `0x${string}`,
        address: market.address,
        abi: NextGoalMarketAbi,
        functionName: 'bet',
        args: [selected],
        value: parseEther('0.005'),
      })
      setState('done')
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 3000)
    }
  }

  if (!isOpen) return null

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-zinc-300">Next goal?</span>
        </div>
        <span className="text-xs text-zinc-500">Locks in {minLeft}m</span>
      </div>

      <div className="flex gap-2 mb-4">
        {[{ label: 'Yes', index: 0 as const }, { label: 'No', index: 1 as const }].map(o => {
          const price = market.prices[o.index]
          const isSelected = selected === o.index
          return (
            <button
              key={o.index}
              onClick={() => setSelected(o.index)}
              className={`flex-1 py-3 rounded-lg border text-sm font-semibold transition-all
                ${isSelected
                  ? 'bg-green-500/20 border-green-500 text-green-400'
                  : 'bg-surface border-border text-zinc-400 hover:border-zinc-500'}
              `}
            >
              <div>{o.label}</div>
              <div className="text-xs font-normal mt-0.5 opacity-70">
                {pct(price)}% · {odds(price)}
              </div>
            </button>
          )
        })}
      </div>

      {state === 'done' ? (
        <div className="text-center text-sm text-green-400">Bet placed ⚡</div>
      ) : !authenticated ? (
        <button onClick={login} className="w-full py-2 bg-green-500 hover:bg-green-600 text-black font-semibold text-sm rounded-lg">
          Sign in to bet
        </button>
      ) : (
        <button
          onClick={placeBet}
          disabled={selected === null || state === 'loading'}
          className="w-full py-2 bg-green-500 hover:bg-green-600 disabled:opacity-40 text-black font-semibold text-sm rounded-lg transition-colors"
        >
          {state === 'loading' ? 'Placing…' : 'Bet 0.005 STT'}
        </button>
      )}

      {state === 'error' && (
        <div className="text-xs text-red-400 mt-2 text-center">Failed. Check balance.</div>
      )}
    </div>
  )
}
