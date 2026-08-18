import { ArrowRight, ClipboardPenLine, LockKeyhole, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TransferCard } from '../components/TransferCard'
import { AppHeader } from '../components/layout/AppHeader'
import { APP_NAME, MONTHLY_FEE } from '../config/app'
import { formatCurrency } from '../utils/format'

export function PublicHomePage() {
  return (
    <div className="public-page">
      <AppHeader />
      <main>
        <section className="hero container">
          <div className="hero__content">
            <span className="eyebrow"><MessageCircle size={16} /> Comunidad, servicio y encuentro</span>
            <h1>Información de cuotas de<br /><em>{APP_NAME}</em></h1>
            <p>Consulta los datos oficiales para aportar e inscríbete como integrante desde cualquier dispositivo.</p>
            <div className="hero__actions">
              <Link className="button button--gold button--large" to="/registro">
                <ClipboardPenLine size={20} /> Inscribirme como integrante
              </Link>
              <a className="button button--light button--large" href="#transferencia">
                Ver datos de transferencia <ArrowRight size={19} />
              </a>
            </div>
          </div>
          <aside className="hero-fee">
            <span>Cuota mensual</span>
            <strong>{formatCurrency(MONTHLY_FEE)}</strong>
            <small>Tu colaboración sostiene nuestras actividades pastorales.</small>
          </aside>
        </section>
        <div className="container public-content" id="transferencia">
          <TransferCard />
          <section className="privacy-card">
            <LockKeyhole size={24} />
            <div>
              <h2>Tu información está protegida</h2>
              <p>El listado de integrantes y el historial de pagos solo son visibles para encargados autenticados.</p>
            </div>
          </section>
        </div>
      </main>
      <footer className="public-footer">{APP_NAME} · Talca</footer>
    </div>
  )
}
