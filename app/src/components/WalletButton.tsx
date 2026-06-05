'use client'

import { usePrivy, useWallets } from '@privy-io/react-auth'
import { shortAddr } from '@/lib/format'

export function WalletButton() {
  const { ready, authenticated, login, logout } = usePrivy()
  const { wallets } = useWallets()
  const wallet = wallets.find(w => w.walletClientType === 'privy')

  if (!ready) return <div className="w-32 h-9 bg-card rounded-lg animate-pulse" />

  if (!authenticated) {
    return (
      <button
        onClick={login}
        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-semibold text-sm rounded-lg transition-colors"
      >
        Sign in
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-zinc-400 font-mono">
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
