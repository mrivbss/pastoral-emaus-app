import { ChevronDown, ChevronUp, ClipboardPenLine, Footprints, LockKeyhole, MessageCircle } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { TransferCard } from '../components/TransferCard'
import { AppHeader } from '../components/layout/AppHeader'
import { APP_NAME, MONTHLY_FEE } from '../config/app'
import { formatCurrency } from '../utils/format'

export function PublicHomePage() {
  const [showTransferDetails, setShowTransferDetails] = useState(false)
  const transferDetailsRef = useRef<HTMLDivElement>(null)

  const toggleTransferDetails = () => {
    const nextState = !showTransferDetails
    setShowTransferDetails(nextState)
    if (nextState) {
      window.requestAnimationFrame(() => {
        transferDetailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }

  return (
    <div className="public-page">
      <AppHeader />
      <main>
        <section className="hero container">
          <div className="hero__content">
            <span className="eyebrow"><MessageCircle size={16} /> Comunidad, servicio y encuentro</span>
            <h1><em>{APP_NAME}</em></h1>
            <p>Consulta los datos oficiales para aportar e inscríbete como servidor desde cualquier dispositivo.</p>
            <div className="hero__actions">
              <Link className="button button--gold button--large" to="/registro">
                <ClipboardPenLine size={20} /> INSCRIPCIÓN SERVIDOR
              </Link>
              <Link className="button button--gold button--large" to="/registro-caminante">
                <Footprints size={20} /> INSCRIPCIÓN CAMINANTE
              </Link>
              <button
                type="button"
                className="button button--light button--large"
                aria-expanded={showTransferDetails}
                aria-controls="transferencia"
                onClick={toggleTransferDetails}
              >
                {showTransferDetails ? 'Ocultar datos de transferencia' : 'Ver datos de transferencia'}
                {showTransferDetails ? <ChevronUp size={19} /> : <ChevronDown size={19} />}
              </button>
            </div>
          </div>
          <aside className="hero-fee">
            <span>Cuota mensual</span>
            <strong>{formatCurrency(MONTHLY_FEE)}</strong>
            <small>Tu colaboración sostiene nuestras actividades pastorales.</small>
          </aside>
        </section>
        <div className="container public-content">
          <div id="transferencia" ref={transferDetailsRef} hidden={!showTransferDetails}>
            <TransferCard />
          </div>
          <section className="privacy-card">
            <LockKeyhole size={24} />
            <div>
              <h2>Tu información está protegida</h2>
              <p>El listado de servidores y el historial de pagos solo son visibles para encargados autenticados.</p>
            </div>
          </section>
        </div>
      </main>
      <footer className="public-footer">{APP_NAME} · Talca</footer>
    </div>
  )
}
