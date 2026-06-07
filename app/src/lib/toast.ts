export type ToastKind = 'success' | 'error' | 'info'

export type Toast = {
  id: string
  kind: ToastKind
  message: string
  txHash?: string
}

type NewToast = Omit<Toast, 'id'>

// Errors stay until the user dismisses them — same convention as the inline
// "Dismiss" button in BetPanel/MatchRow/NextGoalPanel. Success/info clear on
// their own; nobody needs to act on "your bet went through."
const DEFAULT_AUTO_DISMISS_MS: Record<ToastKind, number | null> = {
  success: 4000,
  info: 4000,
  error: null,
}

let nextId = 0
function generateId(): string {
  return `toast-${++nextId}`
}

export class ToastStore {
  private toasts: Toast[] = []
  private listeners = new Set<() => void>()
  private timers = new Map<string, ReturnType<typeof setTimeout>>()
  private autoDismissMs: Record<ToastKind, number | null>

  constructor(autoDismissOverrides: Partial<Record<ToastKind, number | null>> = {}) {
    this.autoDismissMs = { ...DEFAULT_AUTO_DISMISS_MS, ...autoDismissOverrides }
  }

  getToasts = (): Toast[] => this.toasts

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  push = (toast: NewToast): string => {
    const id = generateId()
    this.toasts = [...this.toasts, { ...toast, id }]
    this.notify()

    const ms = this.autoDismissMs[toast.kind]
    if (ms !== null) {
      this.timers.set(id, setTimeout(() => this.dismiss(id), ms))
    }
    return id
  }

  dismiss = (id: string): void => {
    if (!this.toasts.some(t => t.id === id)) return
    const timer = this.timers.get(id)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(id)
    }
    this.toasts = this.toasts.filter(t => t.id !== id)
    this.notify()
  }

  private notify(): void {
    for (const listener of this.listeners) listener()
  }
}
