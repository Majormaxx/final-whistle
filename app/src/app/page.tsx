import { readClient } from '@/lib/sdk'
import { MatchCard } from '@/components/MatchCard'

export const revalidate = 10

async function getMarkets() {
  try {
    const addresses = await readClient.listMatchMarkets()
    const markets = await Promise.all(addresses.map(a => readClient.getMatchMarket(a)))
    return markets.sort((a, b) => Number(b.kickoff - a.kickoff))
  } catch {
    return []
  }
}

export default async function Home() {
  const markets = await getMarkets()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Markets that settle themselves.</h1>
        <p className="text-zinc-400 mt-1">
          Goal scored. Wallet paid. Same block.
        </p>
      </div>

      {markets.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <div className="text-4xl mb-3">⚽</div>
          <div>No markets open yet.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {markets.map(m => <MatchCard key={m.address} market={m} />)}
        </div>
      )}
    </div>
  )
}
