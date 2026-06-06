'use client'

import { useState } from 'react'
import { useWallets } from '@privy-io/react-auth'

type State = 'idle' | 'loading' | 'done' | 'already' | 'error'

export function FaucetButton() {
  const { wallets } = useWallets()
  const wallet = wallets.find(w => w.walletClientType === 'privy')
  const [state, setState] = useState<State>('idle')

  async function drip() {
    if (!wallet || state !== 'idle') return
    setState('loading')
    try {
      const res = await fetch('/api/sponsor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: wallet.address }),
      })
      const body = await res.json()
      if (res.status === 429 || body.error === 'already dripped') {
        setState('already')
        return
      }
      if (!res.ok) throw new Error(body.error ?? 'unknown error')
      if (body.skipped) {
        setState('already')
        return
      }
      setState('done')
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 3000)
    }
  }

  if (!wallet) return null

  const label: Record<State, string> = {
    idle:    'Get STT',
    loading: 'Sending…',
    done:    '0.1 STT sent ✓',
    already: 'Already received',
    error:   'Try again',
  }

  const disabled = state !== 'idle' && state !== 'error'

  return (
    <button
      onClick={state === 'error' ? () => setState('idle') : drip}
      disabled={disabled}
      className={`px-3 py-1.5 border text-xs rounded-lg transition-colors disabled:opacity-50
        ${state === 'done' || state === 'already'
          ? 'border-green-500/40 text-green-400'
          : 'border-border text-zinc-300 hover:text-white hover:border-green-500'
        }`}
    >
      {label[state]}
    </button>
  )
}
