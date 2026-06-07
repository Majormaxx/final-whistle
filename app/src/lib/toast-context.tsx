'use client'

import { createContext, useContext, useMemo, useSyncExternalStore } from 'react'
import { ToastStore } from './toast'
import type { Toast } from './toast'

const ToastContext = createContext<ToastStore | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const store = useMemo(() => new ToastStore(), [])
  return <ToastContext.Provider value={store}>{children}</ToastContext.Provider>
}

function useToastStore(): ToastStore {
  const store = useContext(ToastContext)
  if (!store) throw new Error('useToast/useToasts must be used within a ToastProvider')
  return store
}

export function useToast() {
  const store = useToastStore()
  return { push: store.push, dismiss: store.dismiss }
}

export function useToasts(): Toast[] {
  const store = useToastStore()
  return useSyncExternalStore(store.subscribe, store.getToasts, store.getToasts)
}
