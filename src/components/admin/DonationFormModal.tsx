import { CircleDollarSign, PackageOpen } from 'lucide-react'
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
  const [isMonetary, setIsMonetary] = useState(true)
  const [tangibleDetail, setTangibleDetail] = useState('')
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
    setIsMonetary(donation?.es_monetaria !== false)
    setTangibleDetail(donation?.detalle_tangible || '')
    setDate(donation?.fecha || todayInputValue())
    setMethod(donation?.medio || 'Transferencia bancaria')
    setObservation(donation?.observacion || '')
    setError('')
  }, [donation, open])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const numericAmount = isMonetary ? Number(amount) : 0
    if (isMonetary && (!Number.isInteger(numericAmount) || numericAmount <= 0)) {
      setError('Ingresa un monto de donación válido.')
      return
    }
    const normalizedTangibleDetail = tangibleDetail.trim()
    if (!isMonetary && (normalizedTangibleDetail.length < 2 || normalizedTangibleDetail.length > 500)) {
      setError('Describe la donación tangible usando entre 2 y 500 caracteres.')
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
        es_monetaria: isMonetary,
        detalle_tangible: isMonetary ? null : normalizedTangibleDetail,
        fecha: date,
        medio: isMonetary ? method : 'Otro',
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
        <div className="donation-type-selector field--wide" role="group" aria-label="Tipo de donación">
          <button type="button" className={isMonetary ? 'is-active' : ''} aria-pressed={isMonetary} onClick={() => setIsMonetary(true)}>
            <CircleDollarSign size={23} />
            <span><strong>Donación monetaria ($)</strong><small>Registrar un aporte de dinero</small></span>
          </button>
          <button type="button" className={!isMonetary ? 'is-active' : ''} aria-pressed={!isMonetary} onClick={() => setIsMonetary(false)}>
            <PackageOpen size={23} />
            <span><strong>Donación tangible / especie</strong><small>Mercadería, artículos u otros</small></span>
          </button>
        </div>
        <label className="field"><span>Nombre del donante</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Donante anónimo" /></label>
        <label className="field"><span>Teléfono</span><input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+56 9 1234 5678" /></label>
        <label className="field"><span>Correo electrónico</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="correo@ejemplo.cl" /></label>
        {isMonetary ? (
          <label className="field"><span>Monto *</span><input type="number" min="1" step="1" inputMode="numeric" required value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="10000" /></label>
        ) : (
          <label className="field field--wide"><span>Detalle de la donación tangible *</span><textarea rows={4} required minLength={2} maxLength={500} value={tangibleDetail} onChange={(event) => setTangibleDetail(event.target.value)} placeholder="Ej.: Mercadería para retiro, 5 paquetes de fideos y café" /><small>{tangibleDetail.trim().length}/500 caracteres</small></label>
        )}
        <label className="field"><span>Fecha *</span><input type="date" required value={date} onChange={(event) => setDate(event.target.value)} /></label>
        {isMonetary && <label className="field"><span>Medio de aporte</span><select value={method} onChange={(event) => setMethod(event.target.value as DonationMethod)}>{DONATION_METHODS.map((item) => <option key={item}>{item}</option>)}</select></label>}
        <label className="field field--wide"><span>Observación / referencia</span><textarea rows={3} value={observation} onChange={(event) => setObservation(event.target.value)} placeholder="Actividad, motivo o número de transferencia" /></label>
        {error && <p className="form-error field--wide" role="alert">{error}</p>}
        <div className="form-actions field--wide">
          <button type="button" className="button button--ghost" onClick={onClose} disabled={saving}>Cancelar</button>
          <button className="button button--gold" disabled={saving}>{saving ? 'Guardando…' : 'Guardar donación'}</button>
        </div>
      </form>
    </Modal>
  )
}
