import { CalendarDays } from 'lucide-react'
import { MONTHS } from '../../config/app'
import type { PeriodFilter } from '../../types'

interface MonthYearSelectorProps {
  value: PeriodFilter
  onChange: (value: PeriodFilter) => void
}

export function MonthYearSelector({ value, onChange }: MonthYearSelectorProps) {
  return (
    <div className="period-selector" aria-label="Período a revisar">
      <CalendarDays size={20} />
      <label>
        <span>Mes</span>
        <select
          value={value.month}
          onChange={(event) => onChange({ ...value, month: Number(event.target.value) })}
        >
          {MONTHS.map((month, index) => (
            <option key={month} value={index + 1}>{month}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Año</span>
        <input
          type="number"
          min="2020"
          max="2100"
          inputMode="numeric"
          value={value.year}
          onChange={(event) => onChange({ ...value, year: Number(event.target.value) })}
        />
      </label>
    </div>
  )
}
