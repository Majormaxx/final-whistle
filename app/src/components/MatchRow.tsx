'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { createWalletClient, custom, parseEther } from 'viem'
import { MatchMarketAbi, MarketStatus } from '@final-whistle/sdk'
import { somniaTestnet } from '@/lib/chain'
import { odds, pct, winEstimate, kickoffLabel } from '@/lib/format'
import { saveBet } from '@/lib/bets'
import type { MatchMarketInfo } from '@final-whistle/sdk'
import type { Fixture } from '@/lib/fixtures'

type Outcome = 0 | 1 | 2

const OUTCOME_META = [
  { label: 'Home wins', color: 'text-green-400', ring: 'ring-green-500/60', activeBg: 'bg-green-500/20', hoverBg: 'hover:bg-green-500/10' },
  { label: 'Draw',      color: 'text-zinc-300',  ring: 'ring-zinc-500/60',  activeBg: 'bg-zinc-600/30',  hoverBg: 'hover:bg-zinc-700/30' },
  { label: 'Away wins', color: 'text-blue-400',  ring: 'ring-blue-500/60',  activeBg: 'bg-blue-500/20',  hoverBg: 'hover:bg-blue-500/10' },
]

const PRESETS = ['0.01', '0.05', '0.1', '0.25']

function useOddsFlash(prices: readonly bigint[]) {
  const prev = useRef<readonly bigint[]>(prices)
  const [flash, setFlash] = useState<('up' | 'down' | null)[]>([null, null, null])

  useEffect(() => {
    const next = flash.map((_, i) => {
      if (prices[i] === prev.current[i]) return null
      return prices[i] > prev.current[i] ? 'up' : 'down'
    }) as ('up' | 'down' | null)[]
    if (next.some(f => f !== null)) {
      setFlash(next)
      const t = setTimeout(() => setFlash([null, null, null]), 1500)
      prev.current = prices
      return () => clearTimeout(t)
    }
    prev.current = prices
  }, [prices])

  return flash
}

export function MatchRow({
  market,
  fixture,
  isLast,
}: {
  market: MatchMarketInfo
  fixture?: Fixture
  isLast: boolean
}) {
  const { authenticated, login } = usePrivy()
  const { wallets } = useWallets()
  const [selected, setSelected] = useState<Outcome | null>(null)
  const [amount, setAmount] = useState('0.01')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [txHash, setTxHash] = useState<string>()
  const flash = useOddsFlash(market.prices)

  const isOpen = market.status === MarketStatus.Open
  const isClosed = market.status === MarketStatus.Closed
  const isResolved = market.status === MarketStatus.Resolved
  const isBettable = isOpen
  const privyWallet = wallets.find(w => w.walletClientType === 'privy')

  const hasScore = fixture && (fixture.goals.home !== null || fixture.status === 'finished')
  const league = fixture?.league ?? 'World Cup Qualification'

  function handleOddsClick(i: Outcome) {
    if (!isBettable) return
    setSelected(prev => (prev === i ? null : i))
    setStatus('idle')
  }

  async function placeBet() {
    if (selected === null || !privyWallet) return
    setStatus('loading')
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
        homeTeam: market.homeTeam,
        awayTeam: market.awayTeam,
        league,
        outcome: selected,
        amount,
        timestamp: Date.now(),
      })
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3500)
    }
  }

  function flashClass(i: number) {
    if (flash[i] === 'up')   return 'animate-flash-up'
    if (flash[i] === 'down') return 'animate-flash-down'
    return ''
  }

  return (
    <div className={`${!isLast ? 'border-b border-border' : ''}`}>
      {/* Main row */}
      <div className="flex items-center px-4 py-3 gap-3">
        {/* Status + league */}
        <div className="w-16 shrink-0">
          {isOpen ? (
            <span className="flex items-center gap-1 text-[11px] text-green-500 font-semibold">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              {fixture?.elapsed != null ? `${fixture.elapsed}'` : 'LIVE'}
            </span>
          ) : isClosed ? (
            <span className="text-[11px] text-amber-500 font-semibold">SUSP</span>
          ) : isResolved ? (
            <span className="text-[11px] text-zinc-500">SETTLED</span>
          ) : (
            <span className="text-[11px] text-zinc-500">{kickoffLabel(market.kickoff)}</span>
          )}
          <div className="text-[10px] text-zinc-600 mt-0.5 truncate w-16">{league}</div>
        </div>

        {/* Teams + logos + score */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5">
                {fixture?.homeLogo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={fixture.homeLogo} alt="" width={18} height={18} className="w-[18px] h-[18px] object-contain shrink-0" />
                )}
                <span className="text-sm font-semibold text-white truncate">{market.homeTeam}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {fixture?.awayLogo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={fixture.awayLogo} alt="" width={18} height={18} className="w-[18px] h-[18px] object-contain shrink-0" />
                )}
                <span className="text-sm text-zinc-400 truncate">{market.awayTeam}</span>
              </div>
            </div>
            {hasScore && (
              <div className="shrink-0 text-center px-2">
                <div className="text-base font-bold text-white tabular-nums">{fixture!.goals.home ?? 0}</div>
                <div className="text-base font-bold text-white tabular-nums">{fixture!.goals.away ?? 0}</div>
              </div>
            )}
          </div>
        </div>

        {/* Odds buttons */}
        <div className="flex gap-1.5 shrink-0">
          {([0, 1, 2] as Outcome[]).map(i => {
            const meta = OUTCOME_META[i]
            const price = market.prices[i]
            const isActive = selected === i
            return (
              <button
                key={i}
                onClick={() => handleOddsClick(i)}
                disabled={!isBettable}
                title={isClosed ? 'Market suspended' : undefined}
                className={`w-14 h-12 rounded-lg border text-center transition-all ${flashClass(i)}
                  ${!isBettable
                    ? 'bg-zinc-900/40 border-zinc-800 cursor-not-allowed opacity-50'
                    : isActive
                      ? `${meta.activeBg} border-current ${meta.ring} ring-1 ${meta.color}`
                      : `bg-zinc-800/60 border-zinc-700/50 ${meta.hoverBg} cursor-pointer text-zinc-300`
                  }
                `}
              >
                <div className={`text-sm font-bold leading-tight ${isActive && isBettable ? meta.color : ''}`}>
                  {odds(price)}
                </div>
                <div className="text-[10px] text-zinc-500 leading-tight">{pct(price)}%</div>
              </button>
            )
          })}
        </div>

        {/* Detail link */}
        <Link
          href={`/match/${market.address}`}
          className="shrink-0 text-zinc-600 hover:text-zinc-300 transition-colors pl-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Inline bet panel */}
      {selected !== null && isBettable && (
        <div className="mx-4 mb-3 p-3 rounded-lg bg-zinc-900 border border-zinc-700/60">
          {status === 'done' ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-400 font-medium">⚡ Bet placed. Paid automatically when it settles.</span>
              {txHash && (
                <a
                  href={`https://explorer.somnia.network/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-500 hover:underline ml-2 shrink-0"
                >
                  View →
                </a>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${OUTCOME_META[selected].color} shrink-0`}>
                  {OUTCOME_META[selected].label} · {odds(market.prices[selected])}
                </span>
                <span className="text-xs text-zinc-500 ml-auto shrink-0">
                  Win: <span className="text-green-400 font-medium">
                    {winEstimate(parseEther(amount || '0'), market.prices[selected])}
                  </span>
                </span>
              </div>

              {/* Preset stakes */}
              <div className="flex gap-1.5">
                {PRESETS.map(p => (
                  <button
                    key={p}
                    onClick={() => setAmount(p)}
                    className={`flex-1 py-1 text-xs rounded border transition-colors
                      ${amount === p
                        ? 'border-green-500/60 bg-green-500/10 text-green-400'
                        : 'border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'
                      }`}
                  >
                    {p}
                  </button>
                ))}
                <input
                  type="number"
                  value={amount}
                  min="0.001"
                  step="0.001"
                  onChange={e => setAmount(e.target.value)}
                  className="w-20 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white
                    focus:outline-none focus:border-green-500/60 text-center"
                  placeholder="STT"
                />
              </div>

              <div className="flex gap-2">
                {!authenticated ? (
                  <button
                    onClick={login}
                    className="flex-1 py-2 bg-green-500 hover:bg-green-400 text-black text-sm font-bold rounded-lg transition-colors"
                  >
                    Sign in to bet
                  </button>
                ) : (
                  <button
                    onClick={placeBet}
                    disabled={status === 'loading'}
                    className="flex-1 py-2 bg-green-500 hover:bg-green-400 disabled:opacity-50
                      text-black text-sm font-bold rounded-lg transition-colors"
                  >
                    {status === 'loading' ? 'Placing…' : `Bet ${amount} STT`}
                  </button>
                )}
                {status === 'error' && (
                  <span className="text-xs text-red-400 self-center">Failed. Check balance.</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
