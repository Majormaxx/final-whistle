'use client'

import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import { useToast, useToasts } from '@/lib/toast-context'
import type { ToastKind } from '@/lib/toast'

const KIND_STYLE: Record<ToastKind, { Icon: typeof CheckCircle2; border: string; icon: string }> = {
  success: { Icon: CheckCircle2, border: 'border-green-500/30', icon: 'text-green-400' },
  error:   { Icon: XCircle,      border: 'border-red-500/30',   icon: 'text-red-400'   },
  info:    { Icon: Info,         border: 'border-border',       icon: 'text-zinc-400'  },
}

export function Toaster() {
  const toasts = useToasts()
  const { dismiss } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-[min(22rem,calc(100vw-2rem))]">
      {toasts.map(t => {
        const { Icon, border, icon } = KIND_STYLE[t.kind]
        return (
          <div
            key={t.id}
            role="status"
            className={`flex items-start gap-2.5 bg-card border ${border} rounded-xl px-4 py-3 shadow-lg shadow-black/30 animate-slide-up`}
          >
            <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${icon}`} strokeWidth={2} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-200">{t.message}</p>
              {t.txHash && (
                <a
                  href={`https://explorer.somnia.network/tx/${t.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  View transaction →
                </a>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="shrink-0 text-zinc-600 hover:text-zinc-300 transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
