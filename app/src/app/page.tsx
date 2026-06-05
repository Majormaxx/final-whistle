import { readClient } from '@/lib/sdk'
import { MatchRow } from '@/components/MatchRow'
import type { Address } from 'viem'

export const revalidate = 10

const SEEDED = (process.env.NEXT_PUBLIC_SEEDED_MARKETS ?? '')
  .split(',')
  .map(a => a.trim().toLowerCase())
  .filter(Boolean) as Address[]

async function getMarkets() {
  const seen = new Set<string>()
  const results = []

  // Always include seeded addresses first
  for (const addr of SEEDED) {
    if (seen.has(addr)) continue
    seen.add(addr)
    try {
      results.push(await readClient.getMatchMarket(addr))
    } catch {}
  }

  return results.sort((a, b) => Number(b.kickoff - a.kickoff))
}

export default async function Home() {
  const markets = await getMarkets()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Markets that settle themselves.</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Goal scored. Wallet paid. Same block.</p>
      </div>

      {markets.length === 0 ? (
        <div className="text-center py-20 text-zinc-600">
          <div className="text-5xl mb-4">⚽</div>
          <div className="text-sm">No markets open yet.</div>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="bg-zinc-900/60 px-4 py-2 flex items-center justify-between text-[11px] uppercase tracking-widest text-zinc-500 font-medium border-b border-border">
            <span>Match</span>
            <div className="flex gap-2 w-48 justify-end">
              <span className="w-14 text-center">1</span>
              <span className="w-14 text-center">X</span>
              <span className="w-14 text-center">2</span>
              <span className="w-5" />
            </div>
          </div>
          {markets.map((m, i) => (
            <MatchRow
              key={m.address}
              market={m}
              isLast={i === markets.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
