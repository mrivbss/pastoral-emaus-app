import { useEffect, useState, type FormEvent } from 'react'
import { MONTHLY_FEE } from '../../config/app'
import type { Integrante, Pago } from '../../types'
import { friendlyError } from '../../utils/errors'
import { formatCurrency, monthLabel, todayInputValue } from '../../utils/format'
import { Modal } from '../common/Modal'

interface PaymentModalProps {
  open: boolean
  member: Integrante | null
  payment: Pago | null
  month: number
  year: number
  onClose: () => void
  onSave: (input: { monto: number; fecha_pago: string }) => Promise<void>
  onDelete?: () => void
}

export function PaymentModal({ open, member, payment, month, year, onClose, onSave, onDelete }: PaymentModalProps) {
  const [amount, setAmount] = useState(String(MONTHLY_FEE))
  const [date, setDate] = useState(todayInputValue())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setAmount(String(payment?.monto || MONTHLY_FEE))
    setDate(payment?.fecha_pago || todayInputValue())
    setError('')
  }, [open, payment])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const numericAmount = Number(amount)
    if (!Number.isInteger(numericAmount) || numericAmount <= 0) {
      setError('Ingresa un monto válido, sin decimales.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave({ monto: numericAmount, fecha_pago: date })
      onClose()
    } catch (caught) {
      setError(friendlyError(caught))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} title={payment ? 'Editar pago' : 'Registrar pago'} onClose={onClose} size="small">
      <form className="stack-form" onSubmit={submit}>
        <div className="payment-summary">
          <strong>{member?.nombre}</strong>
          <span>{monthLabel(month, year)}</span>
          <span className={payment ? 'status status--paid' : 'status status--pending'}>{payment ? 'PAGADO' : 'PENDIENTE'}</span>
        </div>
        <label className="field">
          <span>Monto pagado</span>
          <input type="number" min="1" step="1" inputMode="numeric" required value={amount} onChange={(e) => setAmount(e.target.value)} />
          <small>Cuota de referencia: {formatCurrency(MONTHLY_FEE)}</small>
        </label>
        <label className="field">
          <span>Fecha de pago</span>
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions">
          {payment && onDelete && <button type="button" className="button button--danger-soft form-actions__leading" onClick={onDelete} disabled={saving}>Anular pago</button>}
          <button type="button" className="button button--ghost" onClick={onClose} disabled={saving}>Cancelar</button>
          <button className="button button--success" disabled={saving}>{saving ? 'Guardando…' : payment ? 'Guardar cambios' : 'Confirmar pago'}</button>
        </div>
      </form>
    </Modal>
  )
}
