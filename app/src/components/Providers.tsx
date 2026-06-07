'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { somniaTestnet } from '@/lib/chain'
import { ToastProvider } from '@/lib/toast-context'
import { Toaster } from './Toaster'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
        config={{
          loginMethods: ['email', 'google', 'twitter'],
          appearance: {
            theme: 'dark',
            accentColor: '#22c55e',
            logo: '/logo.svg',
          },
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
            requireUserPasswordOnCreate: false,
          },
          supportedChains: [somniaTestnet],
          defaultChain: somniaTestnet,
        }}
      >
        {children}
      </PrivyProvider>
      <Toaster />
    </ToastProvider>
  )
}
