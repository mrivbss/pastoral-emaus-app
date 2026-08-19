import { Search, SlidersHorizontal, X } from 'lucide-react'
import { MEMBER_STATUSES } from '../../config/app'
import type { MemberStatus } from '../../types'

export type PaymentFilter = 'Todos' | 'Pagado' | 'Pendiente'
export type StatusFilter = 'Todos' | MemberStatus

interface MemberFiltersProps {
  search: string
  status: StatusFilter
  payment: PaymentFilter
  onSearch: (value: string) => void
  onStatus: (value: StatusFilter) => void
  onPayment: (value: PaymentFilter) => void
}

export function MemberFilters({ search, status, payment, onSearch, onStatus, onPayment }: MemberFiltersProps) {
  const clear = () => {
    onSearch('')
    onStatus('Todos')
    onPayment('Todos')
  }
  const active = Boolean(search || status !== 'Todos' || payment !== 'Todos')

  return (
    <div className="filters">
      <label className="search-field">
        <Search size={19} />
        <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Buscar por nombre o RUT" aria-label="Buscar servidor" />
      </label>
      <div className="filter-selects">
        <SlidersHorizontal size={18} aria-hidden="true" />
        <label>
          <span>Estado</span>
          <select value={status} onChange={(event) => onStatus(event.target.value as StatusFilter)}>
            <option>Todos</option>
            {MEMBER_STATUSES.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span>Cuota</span>
          <select value={payment} onChange={(event) => onPayment(event.target.value as PaymentFilter)}>
            <option>Todos</option><option>Pagado</option><option>Pendiente</option>
          </select>
        </label>
        {active && <button className="button button--text" onClick={clear}><X size={17} /> Limpiar</button>}
      </div>
    </div>
  )
}
