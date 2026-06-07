'use client'

import { useEffect, useState } from 'react'
import { Loader2, Wallet } from 'lucide-react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { createPublicClient, createWalletClient, custom, http } from 'viem'
import { MarketStatus, Outcome, MatchMarketAbi, NextGoalMarketAbi } from '@final-whistle/sdk'
import { somniaTestnet } from '@/lib/chain'
import { readClient } from '@/lib/sdk'
import { stt } from '@/lib/format'
import { loadBets, marketTypeOf } from '@/lib/bets'
import { useToast } from '@/lib/toast-context'
import type { StoredBet, MarketType } from '@/lib/bets'
import type { Address } from 'viem'

const OUTCOME_LABEL = ['Home wins', 'Draw', 'Away wins']
const OUTCOME_COLOR = ['text-green-400', 'text-zinc-300', 'text-blue-400']

type Settlement = 'pending' | 'won' | 'lost' | 'unknown'
type ClaimStatus = 'idle' | 'loading' | 'done' | 'error'

type BetWithStatus = StoredBet & {
  settlement: Settlement
  claimable: bigint
}

const pub = createPublicClient({ chain: somniaTestnet, transport: http() })

// Maps the on-chain Outcome enum (where HOME=1/DRAW=2/AWAY=3 and YES=4/NO=5)
// back to the raw 0|1|2 (or 0|1) index the contract's bet()/shares[] use —
// the inverse of the +1 / +4 offsets baked into IMarket's Outcome enum.
// Returns null when `result` can't be a winning index for this market type
// (e.g. Outcome.None while still pending, or a stale/malformed read).
function winningIndex(type: MarketType, onChainResult: number): number | null {
  if (type === 'match') {
    const idx = onChainResult - Outcome.Home
    return idx >= 0 && idx <= 2 ? idx : null
  }
  if (onChainResult === Outcome.Yes) return 0
  if (onChainResult === Outcome.No) return 1
  return null
}

async function resolveBet(bet: StoredBet, account: Address | null): Promise<{ settlement: Settlement; claimable: bigint }> {
  const type = marketTypeOf(bet)
  const abi = type === 'match' ? MatchMarketAbi : NextGoalMarketAbi
  const address = bet.marketAddress as Address

  try {
    const [status, result] = await Promise.all([
      pub.readContract({ address, abi, functionName: 'status' }),
      pub.readContract({ address, abi, functionName: 'result' }),
    ])
    if (Number(status) !== MarketStatus.Resolved) return { settlement: 'pending', claimable: 0n }

    const winIdx = winningIndex(type, Number(result))
    if (winIdx === null || winIdx !== bet.outcome) return { settlement: 'lost', claimable: 0n }

    const claimable = !account ? 0n
      : type === 'match'
        ? await readClient.getClaimableMatch(address, account)
        : await readClient.getClaimableNextGoal(address, account)

    return { settlement: 'won', claimable }
  } catch {
    return { settlement: 'unknown', claimable: 0n }
  }
}

export function MyBets() {
  const { authenticated } = usePrivy()
  const { wallets } = useWallets()
  const toast = useToast()
  const privyWallet = wallets.find(w => w.walletClientType === 'privy')
  const account = (privyWallet?.address as Address | undefined) ?? null

  const [bets, setBets] = useState<BetWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [claimStatus, setClaimStatus] = useState<Record<string, ClaimStatus>>({})

  useEffect(() => {
    if (!authenticated) { setLoading(false); return }
    const raw = loadBets()
    if (raw.length === 0) { setLoading(false); return }

    let cancelled = false
    Promise.all(raw.map(async b => {
      const { settlement, claimable } = await resolveBet(b, account)
      return { ...b, marketType: marketTypeOf(b), settlement, claimable }
    })).then(resolved => {
      if (cancelled) return
      setBets(resolved)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [authenticated, account])

  async function claim(bet: BetWithStatus) {
    if (!privyWallet) return
    setClaimStatus(s => ({ ...s, [bet.txHash]: 'loading' }))
    try {
      const provider = await privyWallet.getEthereumProvider()
      const client = createWalletClient({ chain: somniaTestnet, transport: custom(provider) })
      const abi = bet.marketType === 'match' ? MatchMarketAbi : NextGoalMarketAbi
      const hash = await client.writeContract({
        account: privyWallet.address as Address,
        address: bet.marketAddress as Address,
        abi,
        functionName: 'claim',
      })
      await pub.waitForTransactionReceipt({ hash })
      setClaimStatus(s => ({ ...s, [bet.txHash]: 'done' }))
      setBets(prev => prev.map(b => (b.txHash === bet.txHash ? { ...b, claimable: 0n } : b)))
      toast.push({ kind: 'success', message: `Claimed ${stt(bet.claimable, 3)} from ${bet.homeTeam} vs ${bet.awayTeam}`, txHash: hash })
    } catch (err) {
      console.error('Claim failed:', err)
      setClaimStatus(s => ({ ...s, [bet.txHash]: 'error' }))
      toast.push({ kind: 'error', message: 'Claim failed — try again' })
    }
  }

  if (!authenticated) return null

  return (
    <div className="mt-8">
      <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-widest">My Bets</h2>

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map(i => (
            <div key={i} className="h-14 rounded-xl bg-zinc-900 animate-pulse" />
          ))}
        </div>
      ) : bets.length === 0 ? (
        <div className="bg-card border border-border rounded-xl px-5 py-6 text-center">
          <p className="text-sm text-zinc-400">Nothing on the board yet — pick a match above and get in the game.</p>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          {bets.map((bet, i) => {
            const cStatus = claimStatus[bet.txHash] ?? 'idle'
            const alreadyClaimed = cStatus === 'done' || (bet.settlement === 'won' && bet.claimable === 0n)
            const showClaim = bet.settlement === 'won' && (bet.claimable > 0n || cStatus === 'loading')

            return (
              <div
                key={bet.txHash}
                className={`flex items-center gap-3 px-4 py-3 ${i < bets.length - 1 ? 'border-b border-border' : ''}`}
              >
                {/* Result chip */}
                <div
                  title={bet.settlement === 'unknown' ? 'Could not read market status — RPC may be temporarily unavailable' : undefined}
                  className={`shrink-0 w-14 text-center py-1 rounded text-xs font-bold
                    ${bet.settlement === 'won'     ? 'bg-green-500/20 text-green-400' :
                      bet.settlement === 'lost'    ? 'bg-zinc-800 text-zinc-500' :
                      bet.settlement === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                                                     'bg-zinc-800 text-zinc-700'}
                  `}>
                  {bet.settlement === 'won' ? 'WON' : bet.settlement === 'lost' ? 'LOST' : bet.settlement === 'pending' ? 'OPEN' : '—'}
                </div>

                {/* Match + outcome */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-zinc-200 truncate">
                    {bet.homeTeam} vs {bet.awayTeam}
                  </div>
                  <div className={`text-xs ${bet.marketType === 'match' ? OUTCOME_COLOR[bet.outcome] : 'text-zinc-400'}`}>
                    {bet.marketType === 'match' ? OUTCOME_LABEL[bet.outcome] : bet.outcome === 0 ? 'Goal — Yes' : 'Goal — No'} · {bet.amount} STT
                  </div>
                </div>

                {/* Claim / claimed / league+time */}
                {showClaim ? (
                  <button
                    onClick={() => claim(bet)}
                    disabled={cStatus === 'loading'}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-400
                      disabled:opacity-50 text-black text-xs font-bold rounded-lg transition-colors"
                  >
                    {cStatus === 'loading' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Claiming…
                      </>
                    ) : (
                      <>
                        <Wallet className="w-3.5 h-3.5" strokeWidth={2.5} />
                        Claim {stt(bet.claimable, 3)}
                      </>
                    )}
                  </button>
                ) : alreadyClaimed ? (
                  <span className="shrink-0 text-[11px] text-green-400/70 font-medium px-1">Claimed ✓</span>
                ) : (
                  <div className="text-right shrink-0">
                    <div className="text-[11px] text-zinc-600">{bet.league}</div>
                    <div className="text-[11px] text-zinc-700">
                      {new Date(bet.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                )}

                {/* Explorer link */}
                <a
                  href={`https://explorer.somnia.network/tx/${bet.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-zinc-700 hover:text-zinc-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )
          })}
        </div>
      )}

      {claimStatus && Object.values(claimStatus).includes('error') && (
        <div className="mt-2 text-xs text-red-400 px-1">
          A claim transaction failed — try again from the button above.
        </div>
      )}
    </div>
  )
}
