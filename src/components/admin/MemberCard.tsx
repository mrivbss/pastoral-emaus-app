import { ChevronRight, CircleCheckBig, Clock3, Edit3, MessageCircle, Trash2, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MONTHS } from '../../config/app'
import type { Integrante, Pago } from '../../types'
import { formatCurrency } from '../../utils/format'

interface MemberCardProps {
  member: Integrante
  payments: Pago[]
  month: number
  year: number
  onPay: (member: Integrante, payment: Pago | null) => void
  onWhatsApp: (member: Integrante) => void
  onEdit: (member: Integrante) => void
  onDelete: (member: Integrante) => void
}

export function MemberCard({ member, payments, month, year, onPay, onWhatsApp, onEdit, onDelete }: MemberCardProps) {
  const selectedPayment = payments.find((payment) => payment.mes === month) || null
  const isWalker = member.observaciones?.trim().toUpperCase().startsWith('[CAMINANTE]') ?? false

  return (
    <article className="member-card">
      <div className="member-card__top">
        <span className="avatar"><UserRound size={23} /></span>
        <div className="member-card__identity">
          <div className="member-card__name-line">
            <h3>{member.nombre}</h3>
            {isWalker && <span className="member-type-badge">Caminante</span>}
          </div>
          <p>{member.rut} · {member.telefono || 'Sin teléfono'}</p>
        </div>
        <span className={`member-status member-status--${member.estado.toLowerCase()}`}>{member.estado}</span>
      </div>

      <div className={`current-payment ${selectedPayment ? 'current-payment--paid' : 'current-payment--pending'}`}>
        <div>
          {selectedPayment ? <CircleCheckBig size={22} /> : <Clock3 size={22} />}
          <span><small>{MONTHS[month - 1]} {year}</small><strong>{selectedPayment ? 'PAGADO' : 'PENDIENTE'}</strong></span>
        </div>
        {selectedPayment ? (
          <button className="button button--small button--success-soft" onClick={() => onPay(member, selectedPayment)}>
            {formatCurrency(selectedPayment.monto)} · Editar
          </button>
        ) : (
          <button className="button button--small button--success" onClick={() => onPay(member, null)}>Registrar pago</button>
        )}
      </div>

      <div className="year-strip" aria-label={`Cuotas de ${year}`}>
        {MONTHS.map((label, index) => {
          const paid = payments.some((payment) => payment.mes === index + 1)
          return <span className={paid ? 'is-paid' : ''} title={`${label}: ${paid ? 'Pagado' : 'Pendiente'}`} key={label}>{label.slice(0, 1)}</span>
        })}
      </div>

      <div className="member-card__actions">
        <button className="button button--icon-label button--whatsapp-soft" onClick={() => onWhatsApp(member)}><MessageCircle size={18} /> WhatsApp</button>
        <button className="button button--icon-label button--ghost" onClick={() => onEdit(member)}><Edit3 size={17} /> Editar</button>
        <button className="icon-button icon-button--danger" onClick={() => onDelete(member)} aria-label={`Eliminar a ${member.nombre}`}><Trash2 size={18} /></button>
        <Link className="profile-link" to={`/admin/integrantes/${member.id}?year=${year}`}>
          Ver perfil <ChevronRight size={18} />
        </Link>
      </div>
    </article>
  )
}
