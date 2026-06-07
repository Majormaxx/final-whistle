export function Footer() {
  return (
    <footer className="mt-16 border-t border-border px-6 py-8 text-center space-y-3">
      <div className="flex items-center justify-center gap-2">
        <img src="/logo.svg" alt="Final Whistle" className="h-4 w-auto opacity-60" />
        <span className="text-sm text-zinc-500 font-medium">Final Whistle</span>
      </div>
      <p className="text-xs text-zinc-600 max-w-md mx-auto">
        Self-resolving prediction markets on{' '}
        <a
          href="https://somnia.network"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Somnia
        </a>
        . Markets settle on-chain when goals are scored — powered by{' '}
        <span className="text-zinc-500">Somnia Agents</span>.
      </p>
      <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-700">
        <a
          href="https://explorer.somnia.network/address/0x22d0081678Fe1E47cde6fd85512C6BFaB3849BF7"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-zinc-500 transition-colors font-mono"
        >
          Factory ↗
        </a>
        <span>·</span>
        <a
          href="https://explorer.somnia.network/address/0x0FEb20D1705307F610DB6284ADECA9FA89a41DA0"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-zinc-500 transition-colors font-mono"
        >
          Resolver ↗
        </a>
        <span>·</span>
        <span>Somnia Testnet · Chain 50312</span>
      </div>
      <p className="text-[11px] text-zinc-700">
        Testnet only. Not financial advice. For demonstration purposes.
      </p>
    </footer>
  )
}
