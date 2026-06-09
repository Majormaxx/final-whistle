'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, Loader2, Zap } from 'lucide-react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { createWalletClient, custom, parseEther } from 'viem'
import { MatchMarketAbi, MarketStatus } from '@final-whistle/sdk'
import { somniaTestnet } from '@/lib/chain'
import { odds, pct, winEstimate, kickoffLabel, matchPhase } from '@/lib/format'
import { saveBet } from '@/lib/bets'
import { classifyBetError, BET_ERROR_MSG } from '@/lib/bet-error'
import { useToast } from '@/lib/toast-context'
import { TeamLogo } from '@/components/TeamLogo'
import type { MatchMarketInfo } from '@final-whistle/sdk'
import type { Fixture } from '@/lib/fixtures'

type Outcome = 0 | 1 | 2
type BetStatus = 'idle' | 'loading' | 'done' | 'error'

const OUTCOME_META = [
  { label: 'Home wins', color: 'text-green-400', ring: 'ring-green-500/60', activeBg: 'bg-green-500/20', hoverBg: 'hover:bg-green-500/10', ariaLabel: '1' },
  { label: 'Draw',      color: 'text-zinc-300',  ring: 'ring-zinc-500/60',  activeBg: 'bg-zinc-600/30',  hoverBg: 'hover:bg-zinc-700/30',  ariaLabel: 'X' },
  { label: 'Away wins', color: 'text-blue-400',  ring: 'ring-blue-500/60',  activeBg: 'bg-blue-500/20',  hoverBg: 'hover:bg-blue-500/10',  ariaLabel: '2' },
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
  const router = useRouter()
  const { authenticated, login } = usePrivy()
  const { wallets } = useWallets()
  const toast = useToast()
  const [selected, setSelected] = useState<Outcome | null>(null)
  const [amount, setAmount] = useState('0.01')
  const [status, setStatus] = useState<BetStatus>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string>()
  const flash = useOddsFlash(market.prices)

  const isOpen = market.status === MarketStatus.Open
  const isClosed = market.status === MarketStatus.Closed
  const isResolved = market.status === MarketStatus.Resolved
  const isBettable = isOpen

  const isLive = isOpen && matchPhase(market, fixture) === 'live'

  const privyWallet = wallets.find(w => w.walletClientType === 'privy')

  const hasScore = fixture && (fixture.goals.home !== null || fixture.status === 'finished')
  const league = fixture?.league ?? 'World Cup Qualification'

  function handleOddsClick(i: Outcome) {
    if (!isBettable) return
    setSelected(prev => (prev === i ? null : i))
    setStatus('idle')
    setErrorMsg(null)
  }

  async function placeBet() {
    if (selected === null || !privyWallet) return
    setStatus('loading')
    setErrorMsg(null)
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
        marketType: 'match',
        homeTeam: market.homeTeam,
        awayTeam: market.awayTeam,
        league,
        outcome: selected,
        amount,
        timestamp: Date.now(),
      })
      toast.push({ kind: 'success', message: `Bet's down — ${market.homeTeam} vs ${market.awayTeam}. Sit back.`, txHash: hash })
    } catch (err) {
      const kind = classifyBetError(err)
      if (kind === 'rejected') {
        setStatus('idle')
        return
      }
      setErrorMsg(BET_ERROR_MSG[kind])
      setStatus('error')
      toast.push({ kind: 'error', message: BET_ERROR_MSG[kind] })
    }
  }

  function flashClass(i: number) {
    if (flash[i] === 'up')   return 'animate-flash-up'
    if (flash[i] === 'down') return 'animate-flash-down'
    return ''
  }

  function openDetails() {
    router.push(`/match/${market.address}`)
  }

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={`${market.homeTeam} vs ${market.awayTeam} — view match details`}
      onClick={openDetails}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetails() } }}
      className={`cursor-pointer hover:bg-zinc-900/40 transition-colors ${!isLast ? 'border-b border-border' : ''}`}
    >
      {/* Main row */}
      <div className="flex items-center px-4 py-3 gap-3">
        {/* Status + league */}
        <div className="w-16 shrink-0">
          {isLive ? (
            <span className="flex items-center gap-1 text-[11px] text-red-400 font-semibold">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shrink-0" />
              {fixture?.elapsed != null ? `${fixture.elapsed}'` : 'LIVE'}
            </span>
          ) : isClosed ? (
            <span className="text-[11px] text-amber-500 font-semibold">SUSP</span>
          ) : isResolved ? (
            <span className="text-[11px] text-zinc-500">SETTLED</span>
          ) : (
            <span className="text-[11px] text-zinc-500">{kickoffLabel(market.kickoff)}</span>
          )}
          <div className="text-[11px] text-zinc-600 mt-0.5 truncate w-16">{league}</div>
        </div>

        {/* Teams + logos + score */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <TeamLogo src={fixture?.homeLogo ?? null} alt={market.homeTeam} />
                <span className="text-sm font-semibold text-white truncate">{market.homeTeam}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TeamLogo src={fixture?.awayLogo ?? null} alt={market.awayTeam} />
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
        <div className="flex gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
          {([0, 1, 2] as Outcome[]).map(i => {
            const meta = OUTCOME_META[i]
            const price = market.prices[i]
            const isActive = selected === i
            return (
              <button
                key={i}
                onClick={() => handleOddsClick(i)}
                disabled={!isBettable}
                aria-label={`${meta.ariaLabel} — ${meta.label}, odds ${odds(price)}`}
                title={isClosed ? 'Suspended between goal windows — reopens automatically' : undefined}
                className={`w-14 h-12 rounded-lg border text-center transition-all ${flashClass(i)}
                  ${!isBettable
                    ? 'bg-zinc-900/40 border-zinc-800 cursor-not-allowed opacity-50'
                    : isActive
                      ? `${meta.activeBg} border-current ${meta.ring} ring-1 ${meta.color}`
                      : `bg-zinc-800/60 border-zinc-800 ${meta.hoverBg} cursor-pointer text-zinc-300`
                  }
                `}
              >
                <div className={`text-sm font-bold leading-tight ${isActive && isBettable ? meta.color : ''}`}>
                  {odds(price)}
                </div>
                <div className="text-[11px] text-zinc-500 leading-tight">{pct(price)}%</div>
              </button>
            )
          })}
        </div>

        {/* Detail link — row itself now navigates; chevron stays as the visual cue */}
        <Link
          href={`/match/${market.address}`}
          aria-label="View match details"
          onClick={e => e.stopPropagation()}
          className="shrink-0 text-zinc-600 hover:text-zinc-300 transition-colors pl-1"
        >
          <ChevronRight className="w-4 h-4" strokeWidth={2} />
        </Link>
      </div>

      {/* Suspended notice */}
      {isClosed && (
        <div className="mx-4 mb-3 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-500/80">
          Market suspended — reopens automatically for the next goal window
        </div>
      )}

      {/* Inline bet panel */}
      {selected !== null && isBettable && (
        <div
          className="mx-4 mb-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800 animate-slide-down"
          onClick={e => e.stopPropagation()}
        >
          {status === 'done' ? (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm text-green-400 font-medium">
                <Zap className="w-3.5 h-3.5" strokeWidth={2.5} />
                You're in. Payout lands the second the final whistle blows.
              </span>
              {txHash && (
                <a
                  href={`https://explorer.somnia.network/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors ml-2 shrink-0"
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
                        : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
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

              <div className="flex flex-col gap-1.5">
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
                      text-black text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Placing…
                      </>
                    ) : `Bet ${amount} STT`}
                  </button>
                )}
                {status === 'error' && errorMsg && (
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs text-red-400">{errorMsg}</span>
                    <button
                      onClick={() => { setStatus('idle'); setErrorMsg(null) }}
                      className="text-xs text-zinc-500 hover:text-zinc-300 underline transition-colors ml-3 shrink-0"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
