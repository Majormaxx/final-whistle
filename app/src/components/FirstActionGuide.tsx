'use client'

import { useEffect, useState } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { createPublicClient, http } from 'viem'
import { Check } from 'lucide-react'
import { somniaTestnet } from '@/lib/chain'
import { loadBets } from '@/lib/bets'
import { FaucetButton } from './FaucetButton'

type StepState = 'done' | 'active' | 'upcoming'

const STEP_STYLE: Record<StepState, { badge: string; text: string }> = {
  done:     { badge: 'bg-green-500 text-black', text: 'text-zinc-400' },
  active:   { badge: 'border border-green-500 text-green-400', text: 'text-white font-medium' },
  upcoming: { badge: 'border border-border text-zinc-600', text: 'text-zinc-600' },
}

// Funnel strip for brand-new users: sign in → fund → bet → watch it resolve.
// Self-dismisses the moment a bet lands in localStorage — at that point
// MyBets (with its own live settlement + claim flow) is the natural place
// to keep watching, so this stops being useful and would only add noise.
export function FirstActionGuide() {
  const { authenticated } = usePrivy()
  const { wallets } = useWallets()
  const wallet = wallets.find(w => w.walletClientType === 'privy')
  const [balance, setBalance] = useState<number | null>(null)
  const [hasBet, setHasBet] = useState(true) // assume yes until checked — avoids a flash on first paint

  useEffect(() => {
    setHasBet(loadBets().length > 0)
  }, [])

  useEffect(() => {
    if (!wallet?.address) { setBalance(null); return }
    const pub = createPublicClient({ chain: somniaTestnet, transport: http() })
    const poll = () => pub.getBalance({ address: wallet.address as `0x${string}` })
      .then(b => setBalance(Number(b) / 1e18))
      .catch(() => {})
    poll()
    const id = setInterval(poll, 8_000)
    return () => clearInterval(id)
  }, [wallet?.address])

  if (!authenticated || hasBet) return null

  const funded = (balance ?? 0) > 0

  const steps: { label: string; state: StepState; action?: React.ReactNode }[] = [
    { label: 'Signed in', state: 'done' },
    { label: 'Get testnet STT', state: funded ? 'done' : 'active', action: !funded ? <FaucetButton /> : undefined },
    { label: 'Place your first bet', state: funded ? 'active' : 'upcoming' },
    { label: 'Watch Somnia Agents resolve it', state: 'upcoming' },
  ]

  return (
    <div className="bg-card border border-border rounded-xl px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
      <span className="text-[11px] uppercase tracking-widest text-zinc-500 font-medium shrink-0">Get started</span>
      <div className="flex items-center gap-2.5 flex-wrap">
        {steps.map((step, i) => {
          const style = STEP_STYLE[step.state]
          return (
            <div key={step.label} className="flex items-center gap-2.5">
              {i > 0 && <div className="w-4 h-px bg-border" />}
              <div className="flex items-center gap-2">
                <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0 ${style.badge}`}>
                  {step.state === 'done' ? <Check className="w-3 h-3" strokeWidth={3} /> : i + 1}
                </span>
                <span className={`text-xs whitespace-nowrap ${style.text}`}>{step.label}</span>
                {step.action}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
