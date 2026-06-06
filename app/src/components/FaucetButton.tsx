'use client'

import { useState } from 'react'
import { useWallets } from '@privy-io/react-auth'

export function FaucetButton() {
  const { wallets } = useWallets()
  const wallet = wallets.find(w => w.walletClientType === 'privy')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  async function drip() {
    if (!wallet || state !== 'idle') return
    setState('loading')
    try {
      const res = await fetch('/api/sponsor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: wallet.address }),
      })
      if (!res.ok) throw new Error(await res.text())
      setState('done')
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 3000)
    }
  }

  if (!wallet) return null

  return (
    <button
      onClick={drip}
      disabled={state !== 'idle'}
      className="px-3 py-1.5 border border-border text-xs rounded-lg transition-colors disabled:opacity-50
        text-zinc-300 hover:text-white hover:border-green-500"
    >
      {state === 'idle'    && 'Get STT'}
      {state === 'loading' && 'Sending…'}
      {state === 'done'    && '0.1 STT received'}
      {state === 'error'   && 'Try again'}
    </button>
  )
}
