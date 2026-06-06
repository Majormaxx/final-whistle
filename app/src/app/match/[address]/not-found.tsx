import Link from 'next/link'

export default function MatchNotFound() {
  return (
    <div className="bg-card border border-border rounded-xl p-10 text-center">
      <p className="text-zinc-400 text-sm mb-1">Market not found</p>
      <p className="text-zinc-600 text-xs mb-6">This address doesn't match any known market</p>
      <Link
        href="/"
        className="px-4 py-2 border border-border text-zinc-400 hover:text-zinc-200 text-sm rounded-lg transition-colors"
      >
        Back to markets
      </Link>
    </div>
  )
}
