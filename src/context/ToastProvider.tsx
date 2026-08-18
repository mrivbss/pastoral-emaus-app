import { useCallback, useState, type PropsWithChildren } from 'react'
import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react'
import { ToastContext, type ToastKind } from './ToastContext'

interface ToastState {
  id: number
  message: string
  kind: ToastKind
}

export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = useCallback((message: string, kind: ToastKind = 'info') => {
    const next = { id: Date.now(), message, kind }
    setToast(next)
    window.setTimeout(() => {
      setToast((current) => (current?.id === next.id ? null : current))
    }, 4500)
  }, [])

  const Icon = toast?.kind === 'success' ? CheckCircle2 : toast?.kind === 'error' ? CircleAlert : Info

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className={`toast toast--${toast.kind}`} role="status" aria-live="polite">
          <Icon size={20} aria-hidden="true" />
          <span>{toast.message}</span>
          <button aria-label="Cerrar mensaje" onClick={() => setToast(null)}>
            <X size={18} />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  )
}
