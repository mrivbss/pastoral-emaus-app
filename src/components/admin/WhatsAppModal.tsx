import { Copy, ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Integrante } from '../../types'
import { paymentMessage, whatsappUrl } from '../../utils/whatsapp'
import { useToast } from '../../hooks/useToast'
import { Modal } from '../common/Modal'

interface WhatsAppModalProps {
  open: boolean
  member: Integrante | null
  month: number
  year: number
  paid: boolean
  onClose: () => void
}

export function WhatsAppModal({ open, member, month, year, paid, onClose }: WhatsAppModalProps) {
  const [message, setMessage] = useState('')
  const { showToast } = useToast()

  useEffect(() => {
    if (open && member) setMessage(paymentMessage(member.nombre, month, year, paid))
  }, [member, month, open, paid, year])

  const copy = async () => {
    await navigator.clipboard.writeText(message)
    showToast('Mensaje copiado.', 'success')
  }

  const openWhatsApp = () => {
    window.open(whatsappUrl(message, member?.telefono), '_blank', 'noopener,noreferrer')
  }

  return (
    <Modal open={open} title="Recordatorio por WhatsApp" onClose={onClose}>
      <div className="stack-form">
        {!member?.telefono && <p className="notice">Este servidor no tiene teléfono registrado. WhatsApp te permitirá elegir la conversación.</p>}
        <label className="field">
          <span>Mensaje (puedes editarlo antes de abrir WhatsApp)</span>
          <textarea rows={12} value={message} onChange={(event) => setMessage(event.target.value)} />
        </label>
        <div className="form-actions">
          <button className="button button--ghost" onClick={copy}><Copy size={18} /> Copiar</button>
          <button className="button button--whatsapp" onClick={openWhatsApp}><ExternalLink size={18} /> Abrir WhatsApp</button>
        </div>
        <small>El envío final siempre se confirma manualmente en WhatsApp.</small>
      </div>
    </Modal>
  )
}
