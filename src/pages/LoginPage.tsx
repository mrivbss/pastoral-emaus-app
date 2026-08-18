import { ArrowLeft, LockKeyhole } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import { useAuth } from '../hooks/useAuth'
import { signIn, signOut } from '../services/auth'
import { LoadingScreen } from '../components/common/LoadingScreen'
import { friendlyError } from '../utils/errors'

export function LoginPage() {
  const { session, loading, isAdmin } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  if (loading) return <LoadingScreen label="Comprobando acceso…" />
  if (session && isAdmin) return <Navigate to="/admin" replace />

  if (session && !isAdmin) {
    return (
      <main className="login-page">
        <section className="login-card">
          <span className="login-card__icon"><LockKeyhole size={22} /></span>
          <h1>Cuenta no autorizada</h1>
          <p>Esta cuenta existe, pero no está habilitada en la lista de administradores.</p>
          <button className="button button--primary button--large" onClick={() => void signOut()}>Cerrar sesión e intentar con otra cuenta</button>
        </section>
      </main>
    )
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await signIn(email.trim(), password)
      const destination = (location.state as { from?: string } | null)?.from || '/admin'
      navigate(destination, { replace: true })
    } catch (caught) {
      setError(friendlyError(caught))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <Link className="back-link" to="/"><ArrowLeft size={18} /> Volver al sitio público</Link>
        <img src={logo} alt="Logo Emaús Varones P.S.A.H. Talca" />
        <span className="login-card__icon"><LockKeyhole size={22} /></span>
        <h1>Acceso administrativo</h1>
        <p>Ingresa con la cuenta creada por el administrador de Supabase.</p>
        <form className="stack-form" onSubmit={submit}>
          <label className="field"><span>Correo electrónico</span><input required type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label className="field"><span>Contraseña</span><input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button--primary button--large" disabled={submitting}>{submitting ? 'Ingresando…' : 'Iniciar sesión'}</button>
        </form>
        <small>No existe registro público de administradores.</small>
      </section>
    </main>
  )
}
