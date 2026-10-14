import { Edit3, HandHeart, Mail, PackageOpen, Phone, Trash2 } from 'lucide-react'
import type { Donacion } from '../../types'
import { formatCurrency, formatDate } from '../../utils/format'

interface DonationListProps {
  donations: Donacion[]
  onEdit: (donation: Donacion) => void
  onDelete: (donation: Donacion) => void
}

export function DonationList({ donations, onEdit, onDelete }: DonationListProps) {
  if (!donations.length) {
    return (
      <div className="empty-state">
        <HandHeart size={38} />
        <h3>Aún no hay donaciones</h3>
        <p>Usa “Registrar donación” para agregar el primer aporte.</p>
      </div>
    )
  }

  return (
    <div className="donation-list">
      {donations.map((donation) => {
        const isMonetary = donation.es_monetaria !== false
        return (
          <article className={`donation-card ${isMonetary ? '' : 'donation-card--tangible'}`} key={donation.id}>
            <div className="donation-card__main">
              <span className="donation-icon">{isMonetary ? <HandHeart size={21} /> : <PackageOpen size={21} />}</span>
              <div>
                <h3>{donation.nombre_donante}</h3>
                <p>{formatDate(donation.fecha)}{isMonetary ? ` · ${donation.medio}` : ''}</p>
              </div>
              {isMonetary ? (
                <strong>{formatCurrency(donation.monto)}</strong>
              ) : (
                <span className="tangible-badge">Donación Tangible / Especie</span>
              )}
            </div>
            {!isMonetary && donation.detalle_tangible && <p className="donation-card__tangible-detail">{donation.detalle_tangible}</p>}
            {(donation.telefono || donation.email || donation.observacion) && (
              <div className="donation-card__details">
                {donation.telefono && <span><Phone size={15} /> {donation.telefono}</span>}
                {donation.email && <span><Mail size={15} /> {donation.email}</span>}
                {donation.observacion && <p>{donation.observacion}</p>}
              </div>
            )}
            <div className="donation-card__actions">
              <button className="button button--small button--ghost" onClick={() => onEdit(donation)}><Edit3 size={16} /> Editar</button>
              <button className="button button--small button--danger-soft" onClick={() => onDelete(donation)}><Trash2 size={16} /> Eliminar</button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
