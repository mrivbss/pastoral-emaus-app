import { MONTHS } from '../config/app'

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value)

export const formatDate = (value: string | null) => {
  if (!value) return 'Sin registrar'
  const [year, month, day] = value.slice(0, 10).split('-').map(Number)
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

export const monthLabel = (month: number, year: number) =>
  `${MONTHS[month - 1]} ${year}`

export const todayInputValue = () => {
  const today = new Date()
  const offset = today.getTimezoneOffset()
  return new Date(today.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

export const nullable = (value: string) => value.trim() || null
