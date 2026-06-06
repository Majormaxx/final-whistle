export default function MatchLoading() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex justify-between mb-4">
          <div className="h-3 w-32 bg-zinc-800 rounded animate-pulse" />
          <div className="h-3 w-12 bg-zinc-800 rounded animate-pulse" />
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="h-6 w-28 bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-6 bg-zinc-800/50 rounded animate-pulse" />
          <div className="h-6 w-28 bg-zinc-800 rounded animate-pulse" />
        </div>
        <div className="mt-6 h-9 rounded-lg bg-zinc-800/60 animate-pulse" />
        <div className="mt-4 pt-4 border-t border-border flex justify-between">
          <div className="h-3 w-8 bg-zinc-800/60 rounded animate-pulse" />
          <div className="h-3 w-16 bg-zinc-800/60 rounded animate-pulse" />
        </div>
      </div>
      {/* Bet panel skeleton */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="h-3 w-20 bg-zinc-800 rounded animate-pulse mb-4" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-12 rounded-lg bg-zinc-800/40 animate-pulse mb-2" />
        ))}
        <div className="h-10 rounded-lg bg-zinc-800/60 animate-pulse mt-4" />
      </div>
    </div>
  )
}
