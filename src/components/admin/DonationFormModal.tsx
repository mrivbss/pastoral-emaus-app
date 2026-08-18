import { useEffect, useState, type FormEvent } from 'react'
import { DONATION_METHODS } from '../../config/app'
import type { Donacion, DonacionInput, DonationMethod } from '../../types'
import { friendlyError } from '../../utils/errors'
import { todayInputValue } from '../../utils/format'
import { Modal } from '../common/Modal'

interface DonationFormModalProps {
  open: boolean
  donation: Donacion | null
  onClose: () => void
  onSave: (input: DonacionInput) => Promise<void>
}

export function DonationFormModal({ open, donation, onClose, onSave }: DonationFormModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayInputValue())
  const [method, setMethod] = useState<DonationMethod>('Transferencia bancaria')
  const [observation, setObservation] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setName(donation?.nombre_donante || '')
    setPhone(donation?.telefono || '')
    setEmail(donation?.email || '')
    setAmount(donation ? String(donation.monto) : '')
    setDate(donation?.fecha || todayInputValue())
    setMethod(donation?.medio || 'Transferencia bancaria')
    setObservation(donation?.observacion || '')
    setError('')
  }, [donation, open])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const numericAmount = Number(amount)
    if (!Number.isInteger(numericAmount) || numericAmount <= 0) {
      setError('Ingresa un monto de donación válido.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave({
        nombre_donante: name.trim() || 'Donante anónimo',
        telefono: phone.trim() || null,
        email: email.trim().toLowerCase() || null,
        monto: numericAmount,
        fecha: date,
        medio: method,
        observacion: observation.trim() || null,
      })
      onClose()
    } catch (caught) {
      setError(friendlyError(caught))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} title={donation ? 'Editar donación' : 'Registrar donación'} onClose={onClose} size="large">
      <form className="form-grid" onSubmit={submit}>
        <label className="field"><span>Nombre del donante</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Donante anónimo" /></label>
        <label className="field"><span>Teléfono</span><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+56 9 1234 5678" /></label>
        <label className="field"><span>Correo electrónico</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.cl" /></label>
        <label className="field"><span>Monto *</span><input type="number" min="1" step="1" inputMode="numeric" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="10000" /></label>
        <label className="field"><span>Fecha *</span><input type="date" required value={date} onChange={(e) => setDate(e.target.value)} /></label>
        <label className="field"><span>Medio de aporte</span><select value={method} onChange={(e) => setMethod(e.target.value as DonationMethod)}>{DONATION_METHODS.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="field field--wide"><span>Observación / referencia</span><textarea rows={3} value={observation} onChange={(e) => setObservation(e.target.value)} placeholder="Actividad, motivo o número de transferencia" /></label>
        {error && <p className="form-error field--wide" role="alert">{error}</p>}
        <div className="form-actions field--wide">
          <button type="button" className="button button--ghost" onClick={onClose} disabled={saving}>Cancelar</button>
          <button className="button button--gold" disabled={saving}>{saving ? 'Guardando…' : 'Guardar donación'}</button>
        </div>
      </form>
    </Modal>
  )
}
