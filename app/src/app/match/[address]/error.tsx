'use client'

import Link from 'next/link'

export default function MatchError({
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-10 text-center">
      <p className="text-zinc-400 text-sm mb-1">Couldn't load this market</p>
      <p className="text-zinc-600 text-xs mb-6">RPC may be temporarily unavailable</p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm rounded-lg transition-colors"
        >
          Retry
        </button>
        <Link href="/" className="px-4 py-2 border border-border text-zinc-400 hover:text-zinc-200 text-sm rounded-lg transition-colors">
          Back to markets
        </Link>
      </div>
    </div>
  )
}
