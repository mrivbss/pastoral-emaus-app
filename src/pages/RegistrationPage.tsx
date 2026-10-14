import { ArrowLeft, CheckCircle2, UserPlus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AppHeader } from '../components/layout/AppHeader'
import { registerPublicIntegrante } from '../services/integrantes'
import { friendlyError } from '../utils/errors'
import { formatRut, isValidRut } from '../utils/rut'

const initialForm = {
  nombre: '', rut: '', telefono: '', email: '', fechaIngreso: '', direccion: '', observaciones: '',
}

interface RegistrationPageProps {
  registrationType?: 'servidor' | 'caminante'
}

export function RegistrationPage({ registrationType = 'servidor' }: RegistrationPageProps) {
  const isWalker = registrationType === 'caminante'
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const update = (field: keyof typeof form, value: string) =>
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
      await registerPublicIntegrante({
        ...form,
        nombre: form.nombre.trim(),
        rut: formatRut(form.rut),
        email: form.email.trim().toLowerCase(),
        fechaIngreso: form.fechaIngreso || null,
        observaciones: isWalker
          ? `[CAMINANTE]${form.observaciones.trim() ? ` ${form.observaciones.trim()}` : ''}`
          : form.observaciones.trim(),
      })
      setSuccess(true)
      setForm(initialForm)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (caught) {
      setError(friendlyError(caught))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="public-page">
      <AppHeader />
      <main className="container narrow-page">
        <Link className="back-link" to="/"><ArrowLeft size={18} /> Volver al inicio</Link>
        {success ? (
          <section className="success-panel">
            <CheckCircle2 size={56} />
            <h1>Tu información fue registrada correctamente.</h1>
            <p>Un encargado de la pastoral podrá verla en el área administrativa.</p>
            <button className="button button--primary" onClick={() => setSuccess(false)}>Registrar otra persona</button>
            <Link className="button button--ghost" to="/">Volver al inicio</Link>
          </section>
        ) : (
          <section className="form-card">
            <div className="form-card__heading">
              <span><UserPlus size={24} /></span>
              <div><p>Registro público</p><h1>Inscripción de {isWalker ? 'caminante' : 'servidor'}</h1></div>
            </div>
            <p className="form-intro">
              {isWalker
                ? 'Completa tus datos para participar como caminante en la Pastoral Emaús Varones PSAH. Los campos con * son obligatorios.'
                : 'Completa tus datos para incorporarte al registro de la Pastoral Emaús Varones PSAH. Los campos con * son obligatorios.'}
            </p>
            <form className="form-grid" onSubmit={submit}>
              <label className="field field--wide"><span>Nombre completo *</span><input required minLength={3} autoComplete="name" value={form.nombre} onChange={(e) => update('nombre', e.target.value)} /></label>
              <label className="field"><span>RUT *</span><input required value={form.rut} onChange={(e) => update('rut', e.target.value)} onBlur={() => form.rut && update('rut', formatRut(form.rut))} placeholder="12.345.678-9" /></label>
              <label className="field"><span>Teléfono / WhatsApp *</span><input required type="tel" autoComplete="tel" value={form.telefono} onChange={(e) => update('telefono', e.target.value)} placeholder="+56 9 1234 5678" /></label>
              <label className="field"><span>Correo electrónico *</span><input required type="email" autoComplete="email" value={form.email} onChange={(e) => update('email', e.target.value)} /></label>
              <label className="field"><span>Fecha de cumpleaños</span><input type="date" value={form.fechaIngreso} onChange={(e) => update('fechaIngreso', e.target.value)} /></label>
              <label className="field field--wide"><span>Dirección / comuna *</span><input required autoComplete="street-address" value={form.direccion} onChange={(e) => update('direccion', e.target.value)} /></label>
              <label className="field field--wide"><span>Observaciones</span><textarea rows={4} value={form.observaciones} onChange={(e) => update('observaciones', e.target.value)} placeholder="Información opcional que debamos conocer" /></label>
              {error && <p className="form-error field--wide" role="alert">{error}</p>}
              <p className="privacy-copy field--wide">Tus datos no se muestran públicamente. Solo los administradores autenticados pueden consultarlos.</p>
              <button className="button button--primary button--large field--wide" disabled={saving}>{saving ? <><span className="spinner spinner--small" /> Registrando…</> : 'Enviar inscripción'}</button>
            </form>
          </section>
        )}
      </main>
    </div>
  )
}
