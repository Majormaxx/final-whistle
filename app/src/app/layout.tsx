import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'
import { WalletButton } from '@/components/WalletButton'
import { FaucetButton } from '@/components/FaucetButton'

export const metadata: Metadata = {
  title: 'Final Whistle',
  description: 'Markets that settle themselves. Soccer first.',
  icons: { icon: '/logo.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <header className="border-b border-border px-6 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <img src="/logo.svg" alt="Final Whistle" className="h-6 w-auto" />
              <span className="text-white font-medium text-base tracking-tight">Final Whistle</span>
              <span className="text-xs text-zinc-500 bg-card px-2 py-0.5 rounded-full border border-border">
                Somnia Testnet
              </span>
            </a>
            <div className="flex items-center gap-3">
              <FaucetButton />
              <WalletButton />
            </div>
          </header>
          <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
