import { TriangleAlert } from 'lucide-react'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  busy?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Eliminar',
  busy = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      size="small"
      footer={
        <>
          <button className="button button--ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button className="button button--danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Procesando…' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="confirm-message">
        <TriangleAlert size={26} aria-hidden="true" />
        <p>{message}</p>
      </div>
    </Modal>
  )
}
