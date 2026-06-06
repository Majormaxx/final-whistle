'use client'

import { usePrivy } from '@privy-io/react-auth'
import Image from 'next/image'

export function Hero() {
  const { authenticated, login } = usePrivy()
  if (authenticated) return null

  return (
    <div className="relative mb-10 rounded-2xl overflow-hidden border border-border bg-zinc-900">
      {/* subtle green glow top-left */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-green-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative px-8 py-10 flex flex-col items-center text-center gap-6">
        {/* Logo + wordmark */}
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Final Whistle" className="h-10 w-auto" />
          <span className="text-2xl font-bold text-white tracking-tight">Final Whistle</span>
        </div>

        {/* Tagline */}
        <div>
          <p className="text-3xl font-bold text-white leading-tight">
            Bet on football.
          </p>
          <p className="text-3xl font-bold text-green-400 leading-tight">
            Get paid the same block.
          </p>
        </div>

        <p className="text-zinc-400 text-sm max-w-sm">
          Markets that resolve themselves. When a goal goes in, Somnia Agents read the score on-chain and winners are paid automatically — no operator, no delay.
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-8 text-center">
          <div>
            <div className="text-green-400 text-xl font-bold">⚡</div>
            <div className="text-xs text-zinc-400 mt-1">Instant<br />settlement</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div>
            <div className="text-green-400 text-xl font-bold">📡</div>
            <div className="text-xs text-zinc-400 mt-1">Self-<br />resolving</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div>
            <div className="text-green-400 text-xl font-bold">🔒</div>
            <div className="text-xs text-zinc-400 mt-1">Fully<br />on-chain</div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={login}
          className="px-8 py-3 bg-green-500 hover:bg-green-400 text-black font-bold text-base rounded-xl transition-colors shadow-lg shadow-green-500/20"
        >
          Sign in to start betting
        </button>

        <p className="text-xs text-zinc-600">
          Email, Google or Twitter · Wallet created for you · First 0.1 STT on us
        </p>
      </div>
    </div>
  )
}
