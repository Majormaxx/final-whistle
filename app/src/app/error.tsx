'use client'

export default function GlobalError({
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-zinc-600 text-4xl mb-4">⚠</div>
        <h2 className="text-white font-semibold mb-2">Something went wrong</h2>
        <p className="text-zinc-500 text-sm mb-6">
          The page couldn't load. This is usually a temporary network issue.
        </p>
        <button
          onClick={reset}
          className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm rounded-lg transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
