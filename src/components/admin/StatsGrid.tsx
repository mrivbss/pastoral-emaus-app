import { CircleDollarSign, CircleCheckBig, Clock3, HandHeart, UsersRound } from 'lucide-react'
import { formatCurrency } from '../../utils/format'

interface StatsGridProps {
  activeMembers: number
  paid: number
  pending: number
  collected: number
  donations: number
}

const stats = [
  { key: 'activeMembers', label: 'Servidores activos', icon: UsersRound, tone: 'petrol', money: false },
  { key: 'paid', label: 'Pagados este mes', icon: CircleCheckBig, tone: 'green', money: false },
  { key: 'pending', label: 'Pendientes este mes', icon: Clock3, tone: 'red', money: false },
  { key: 'collected', label: 'Cuotas del mes', icon: CircleDollarSign, tone: 'gold', money: true },
  { key: 'donations', label: 'Donaciones del mes', icon: HandHeart, tone: 'violet', money: true },
] as const

export function StatsGrid(props: StatsGridProps) {
  return (
    <section className="stats-grid" aria-label="Resumen del período">
      {stats.map(({ key, label, icon: Icon, tone, money }) => (
        <article className={`stat-card stat-card--${tone}`} key={key}>
          <span className="stat-card__icon"><Icon size={22} /></span>
          <div>
            <strong>{money ? formatCurrency(props[key]) : props[key]}</strong>
            <span>{label}</span>
          </div>
        </article>
      ))}
    </section>
  )
}
