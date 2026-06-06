'use client'

import { useEffect, useState } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { createPublicClient, http } from 'viem'
import { somniaTestnet } from '@/lib/chain'
import { shortAddr } from '@/lib/format'

export function WalletButton() {
  const { ready, authenticated, login, logout } = usePrivy()
  const { wallets } = useWallets()
  const wallet = wallets.find(w => w.walletClientType === 'privy')
  const [balance, setBalance] = useState<number | null>(null)

  useEffect(() => {
    if (!wallet?.address) { setBalance(null); return }
    const pub = createPublicClient({ chain: somniaTestnet, transport: http() })
    const fetch = () => pub.getBalance({ address: wallet.address as `0x${string}` })
      .then(b => setBalance(Number(b) / 1e18))
      .catch(() => {})
    fetch()
    const id = setInterval(fetch, 15_000)
    return () => clearInterval(id)
  }, [wallet?.address])

  if (!ready) return <div className="w-32 h-9 bg-card rounded-lg animate-pulse" />

  if (!authenticated) {
    return (
      <button
        onClick={login}
        className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-bold text-sm rounded-lg transition-colors"
      >
        Sign in
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {balance !== null && balance > 0 && (
        <span className="text-sm font-semibold text-green-400 tabular-nums">
          {balance.toFixed(3)} STT
        </span>
      )}
      <span className="text-xs text-zinc-500 font-mono hidden sm:inline">
        {wallet ? shortAddr(wallet.address) : '—'}
      </span>
      <button
        onClick={logout}
        className="px-3 py-1.5 border border-border text-zinc-400 hover:text-zinc-200 text-xs rounded-lg transition-colors"
      >
        Sign out
      </button>
    </div>
  )
}
