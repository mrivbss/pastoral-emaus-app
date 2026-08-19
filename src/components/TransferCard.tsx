import { Check, Copy, HeartHandshake, Share2 } from 'lucide-react'
import { useState } from 'react'
import { APP_NAME, BANK_DETAILS, MONTHLY_FEE } from '../config/app'
import { useToast } from '../hooks/useToast'
import { formatCurrency } from '../utils/format'
import { shareAppMessage, whatsappUrl } from '../utils/whatsapp'

const transferText = `${APP_NAME.toUpperCase()}
Cuota mensual: ${formatCurrency(MONTHLY_FEE)}

Datos para transferencia:
Nombre: ${BANK_DETAILS.nombre}
RUT: ${BANK_DETAILS.rut}
${BANK_DETAILS.institucion}
Tipo de cuenta: ${BANK_DETAILS.tipoCuenta}
Número de cuenta: ${BANK_DETAILS.numeroCuenta}
Correo: ${BANK_DETAILS.correo}`

export function TransferCard({ compact = false }: { compact?: boolean }) {
  const [copied, setCopied] = useState(false)
  const { showToast } = useToast()

  const copyDetails = async () => {
    try {
      await navigator.clipboard.writeText(transferText)
      setCopied(true)
      showToast('Datos de transferencia copiados.', 'success')
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      showToast('No fue posible copiar. Mantén presionados los datos para copiarlos.', 'error')
    }
  }

  const share = () => window.open(whatsappUrl(shareAppMessage()), '_blank', 'noopener,noreferrer')

  return (
    <section className={`transfer-card ${compact ? 'transfer-card--compact' : ''}`}>
      <div className="section-heading">
        <span className="section-heading__icon"><HeartHandshake size={22} /></span>
        <div>
          <p>Aportes y cuotas</p>
          <h2>Datos para transferencia</h2>
        </div>
        <span className="fee-pill">{formatCurrency(MONTHLY_FEE)} / mes</span>
      </div>
      <dl className="bank-details">
        <div><dt>Nombre</dt><dd>{BANK_DETAILS.nombre}</dd></div>
        <div><dt>RUT</dt><dd>{BANK_DETAILS.rut}</dd></div>
        <div><dt>Banco / Institución</dt><dd>{BANK_DETAILS.institucion}</dd></div>
        <div><dt>Tipo</dt><dd>{BANK_DETAILS.tipoCuenta}</dd></div>
        <div><dt>Número</dt><dd>{BANK_DETAILS.numeroCuenta}</dd></div>
        <div><dt>Correo</dt><dd><a href={`mailto:${BANK_DETAILS.correo}`}>{BANK_DETAILS.correo}</a></dd></div>
      </dl>
      <div className="transfer-card__actions">
        <button className="button button--gold" onClick={copyDetails}>
          {copied ? <Check size={19} /> : <Copy size={19} />}
          {copied ? 'Datos copiados' : 'Copiar datos de transferencia'}
        </button>
        {!compact && (
          <button className="button button--secondary" onClick={share}>
            <Share2 size={19} /> Compartir datos
          </button>
        )}
      </div>
      {!compact && <p className="transfer-note">Tu aporte ayuda a sostener las actividades de {APP_NAME}.</p>}
    </section>
  )
}
