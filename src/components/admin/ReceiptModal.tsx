import { Copy, MessageCircle, Printer } from 'lucide-react'
import { useEffect, useState } from 'react'
import logo from '../../assets/logo.png'
import type { Ingreso } from '../../types'
import { formatCurrency, formatDate } from '../../utils/format'
import { incomeReceiptMessage, whatsappUrl } from '../../utils/whatsapp'
import { Modal } from '../common/Modal'

interface ReceiptModalProps {
  open: boolean
  income: Ingreso | null
  onClose: () => void
}

const copyText = async (value: string) => {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(value)
    return
  }
  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  textarea.remove()
}

export function ReceiptModal({ open, income, onClose }: ReceiptModalProps) {
  const [responsibleSigner, setResponsibleSigner] = useState('Patricio Burdiles')
  const [receiverSigner, setReceiverSigner] = useState('Manuel Muñoz')
  const [copyStatus, setCopyStatus] = useState('')

  useEffect(() => {
    if (!open) return
    setResponsibleSigner('Patricio Burdiles')
    setReceiverSigner('Manuel Muñoz')
    setCopyStatus('')
  }, [income, open])

  const shareByWhatsApp = () => {
    if (!income) return
    window.open(whatsappUrl(incomeReceiptMessage(income)), '_blank', 'noopener,noreferrer')
  }

  const copySummary = async () => {
    if (!income) return
    try {
      await copyText(incomeReceiptMessage(income))
      setCopyStatus('Resumen copiado.')
    } catch {
      setCopyStatus('No fue posible copiar. Intenta nuevamente.')
    }
  }

  return (
    <Modal
      open={open}
      title={`Comprobante${income ? ` de ${income.tipo.toLocaleLowerCase('es')}` : ''}`}
      onClose={onClose}
      size="large"
    >
      {income && (
        <div className="receipt-modal-content">
          <article className="receipt-print-area">
            <header className="receipt-header">
              <img src={logo} alt="Logo Pastoral Emaús Varones PSAH" />
              <div>
                <strong>PARROQUIA SAN ALBERTO HURTADO DE TALCA</strong>
                <span>PASTORAL EMAÚS VARONES PSAH</span>
              </div>
            </header>
            <h2 className="receipt-title">COMPROBANTE DE {income.tipo.toUpperCase()}</h2>

            <div className="receipt-reference-grid">
              <div><span>Movimiento N°</span><strong>{income.folio}</strong></div>
              <div><span>N° Comprobante / Referencia</span><strong>{income.comprobante?.trim() || `Movimiento ${income.folio}`}</strong></div>
            </div>

            <dl className="receipt-details">
              <div><dt>Fecha</dt><dd>{formatDate(income.fecha)}</dd></div>
              <div><dt>Tipo</dt><dd>{income.tipo}</dd></div>
              <div><dt>Concepto</dt><dd>[#{String(income.codigo_concepto).padStart(2, '0')}] {income.concepto}</dd></div>
              <div className="receipt-details__large">
                <dt>Detalle / Responsable</dt>
                <dd>{income.detalle_responsable}{income.observacion && <small>{income.observacion}</small>}</dd>
              </div>
              <div><dt>Precio Unitario</dt><dd>{formatCurrency(income.precio_unitario)}</dd></div>
              <div><dt>Cantidad</dt><dd>{income.cantidad}</dd></div>
            </dl>

            <div className="receipt-total">
              <span>MONTO TOTAL</span>
              <strong>{formatCurrency(income.monto_total)}</strong>
            </div>

            <footer className="receipt-signatures">
              <label>
                <span className="receipt-signature__line" />
                <input value={responsibleSigner} onChange={(event) => setResponsibleSigner(event.target.value)} aria-label="Nombre de quien firma como responsable" />
                <small>Firma responsable</small>
              </label>
              <label>
                <span className="receipt-signature__line" />
                <input value={receiverSigner} onChange={(event) => setReceiverSigner(event.target.value)} aria-label="Nombre de quien firma como receptor o receptora" />
                <small>Firma receptor/a</small>
              </label>
            </footer>
          </article>

          <div className="receipt-actions">
            <button className="button button--primary" onClick={() => window.print()}><Printer size={18} /> Imprimir / Guardar PDF</button>
            <button className="button button--whatsapp" onClick={shareByWhatsApp}><MessageCircle size={18} /> Compartir resumen por WhatsApp</button>
            <button className="button button--ghost" onClick={() => void copySummary()}><Copy size={18} /> Copiar resumen</button>
          </div>
          {copyStatus && <p className="receipt-copy-status" role="status">{copyStatus}</p>}
        </div>
      )}
    </Modal>
  )
}
