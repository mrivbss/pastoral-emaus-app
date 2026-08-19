import { useEffect, useState, type FormEvent } from 'react'
import { MEMBER_STATUSES } from '../../config/app'
import type { Integrante, IntegranteInput, MemberStatus } from '../../types'
import { friendlyError } from '../../utils/errors'
import { formatRut, isValidRut } from '../../utils/rut'
import { todayInputValue } from '../../utils/format'
import { Modal } from '../common/Modal'

interface MemberFormModalProps {
  open: boolean
  member: Integrante | null
  onClose: () => void
  onSave: (input: IntegranteInput) => Promise<void>
}

interface FormState {
  nombre: string
  rut: string
  telefono: string
  email: string
  fecha_ingreso: string
  estado: MemberStatus
  direccion: string
  observaciones: string
}

const emptyForm = (): FormState => ({
  nombre: '',
  rut: '',
  telefono: '',
  email: '',
  fecha_ingreso: todayInputValue(),
  estado: 'Activo',
  direccion: '',
  observaciones: '',
})

export function MemberFormModal({ open, member, onClose, onSave }: MemberFormModalProps) {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setError('')
    setForm(
      member
        ? {
            nombre: member.nombre,
            rut: member.rut,
            telefono: member.telefono || '',
            email: member.email || '',
            fecha_ingreso: member.fecha_ingreso || '',
            estado: member.estado,
            direccion: member.direccion || '',
            observaciones: member.observaciones || '',
          }
        : emptyForm(),
    )
  }, [member, open])

  const update = (field: keyof FormState, value: string) =>
    setForm((current) => ({ ...current, [field]: value }))

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (!isValidRut(form.rut)) {
      setError('Ingresa un RUT chileno válido.')
      return
    }
    setSaving(true)
    try {
      await onSave({
        nombre: form.nombre.trim(),
        rut: formatRut(form.rut),
        telefono: form.telefono.trim() || null,
        email: form.email.trim().toLowerCase() || null,
        fecha_ingreso: form.fecha_ingreso || null,
        estado: form.estado,
        direccion: form.direccion.trim() || null,
        observaciones: form.observaciones.trim() || null,
      })
      onClose()
    } catch (caught) {
      setError(friendlyError(caught))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} title={member ? 'Editar servidor' : 'Nuevo servidor'} onClose={onClose} size="large">
      <form id="member-form" className="form-grid" onSubmit={submit}>
        <label className="field field--wide">
          <span>Nombre completo *</span>
          <input required autoComplete="name" value={form.nombre} onChange={(e) => update('nombre', e.target.value)} placeholder="Nombre y apellido" />
        </label>
        <label className="field">
          <span>RUT *</span>
          <input required value={form.rut} onBlur={() => form.rut && update('rut', formatRut(form.rut))} onChange={(e) => update('rut', e.target.value)} placeholder="12.345.678-9" />
        </label>
        <label className="field">
          <span>Teléfono / WhatsApp</span>
          <input type="tel" autoComplete="tel" value={form.telefono} onChange={(e) => update('telefono', e.target.value)} placeholder="+56 9 1234 5678" />
        </label>
        <label className="field">
          <span>Correo electrónico</span>
          <input type="email" autoComplete="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="correo@ejemplo.cl" />
        </label>
        <label className="field">
          <span>Fecha de ingreso</span>
          <input type="date" value={form.fecha_ingreso} onChange={(e) => update('fecha_ingreso', e.target.value)} />
        </label>
        <label className="field">
          <span>Estado</span>
          <select value={form.estado} onChange={(e) => update('estado', e.target.value)}>
            {MEMBER_STATUSES.map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
        <label className="field field--wide">
          <span>Dirección / comuna</span>
          <input autoComplete="street-address" value={form.direccion} onChange={(e) => update('direccion', e.target.value)} placeholder="Dirección o comuna" />
        </label>
        <label className="field field--wide">
          <span>Observaciones</span>
          <textarea rows={3} value={form.observaciones} onChange={(e) => update('observaciones', e.target.value)} placeholder="Información adicional (opcional)" />
        </label>
        {error && <p className="form-error field--wide" role="alert">{error}</p>}
        <div className="form-actions field--wide">
          <button type="button" className="button button--ghost" onClick={onClose} disabled={saving}>Cancelar</button>
          <button type="submit" className="button button--primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar servidor'}</button>
        </div>
      </form>
    </Modal>
  )
}
