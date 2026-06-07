'use client'

import { useState } from 'react'
import { useWallets } from '@privy-io/react-auth'

type State = 'idle' | 'loading' | 'done' | 'already' | 'error' | 'unavailable'

export function FaucetButton() {
  const { wallets } = useWallets()
  const wallet = wallets.find(w => w.walletClientType === 'privy')
  const [state, setState] = useState<State>('idle')

  async function drip() {
    if (!wallet || (state !== 'idle' && state !== 'error')) return
    setState('loading')
    try {
      const res = await fetch('/api/sponsor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: wallet.address }),
      })
      const body = await res.json()
      if (res.status === 503) { setState('unavailable'); return }
      if (res.status === 429 || body.error === 'already dripped') { setState('already'); return }
      if (!res.ok) throw new Error(body.error ?? 'unknown')
      if (body.skipped) { setState('already'); return }
      setState('done')
    } catch {
      setState('error')
    }
  }

  if (!wallet) return null

  const config: Record<State, { label: string; green: boolean; disabled: boolean }> = {
    idle:        { label: 'Get STT',          green: false, disabled: false },
    loading:     { label: 'Sending…',         green: false, disabled: true  },
    done:        { label: '0.1 STT sent ✓',   green: true,  disabled: true  },
    already:     { label: 'Already received', green: true,  disabled: true  },
    unavailable: { label: 'Faucet offline',   green: false, disabled: true  },
    error:       { label: 'Try again',         green: false, disabled: false },
  }

  const { label, green, disabled } = config[state]

  return (
    <button
      onClick={drip}
      disabled={disabled}
      className={`px-3 py-1.5 border text-xs rounded-lg transition-colors disabled:opacity-50
        ${green
          ? 'border-green-500/40 text-green-400'
          : 'border-border text-zinc-300 hover:text-white hover:border-green-500'
        }`}
    >
      {label}
    </button>
  )
}
