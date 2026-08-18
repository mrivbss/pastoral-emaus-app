import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="not-found">
      <span>404</span>
      <h1>Esta página no existe</h1>
      <p>El enlace puede estar incompleto o haber cambiado.</p>
      <Link className="button button--primary" to="/"><ArrowLeft size={18} /> Volver al inicio</Link>
    </main>
  )
}
