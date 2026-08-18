import { MONTHS } from '../config/app'
import type { Donacion, Integrante, Pago } from '../types'

const download = (blob: Blob, filename: string) => {
  const anchor = document.createElement('a')
  const url = URL.createObjectURL(blob)
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const csvCell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`

export const exportPaymentsCsv = (
  members: Integrante[],
  payments: Pago[],
  year: number,
) => {
  const header = [
    'Integrante',
    'RUT',
    'Teléfono',
    'Email',
    'Estado',
    ...MONTHS,
    'Total anual pagado',
  ]
  const rows = members.map((member) => {
    const memberPayments = payments.filter(
      (payment) => payment.integrante_id === member.id && payment.anio === year,
    )
    const monthStatus = MONTHS.map((_, index) =>
      memberPayments.some((payment) => payment.mes === index + 1)
        ? 'Pagado'
        : 'Pendiente',
    )
    const total = memberPayments.reduce((sum, payment) => sum + payment.monto, 0)
    return [
      member.nombre,
      member.rut,
      member.telefono || '',
      member.email || '',
      member.estado,
      ...monthStatus,
      total,
    ]
  })
  const csv = `\ufeff${[header, ...rows].map((row) => row.map(csvCell).join(';')).join('\n')}`
  download(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `cuotas_emaus_${year}.csv`)
}

export const exportJsonBackup = (
  members: Integrante[],
  payments: Pago[],
  donations: Donacion[],
) => {
  const payload = {
    version: 2,
    exportedAt: new Date().toISOString(),
    integrantes: members,
    pagos: payments,
    donaciones: donations,
    legacyImportReady: true,
  }
  download(
    new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
    `respaldo_emaus_${new Date().toISOString().slice(0, 10)}.json`,
  )
}
