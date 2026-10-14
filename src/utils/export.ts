import { MONTHS } from '../config/app'
import type { Donacion, Ingreso, Integrante, Pago } from '../types'

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
    'Servidor',
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
  incomes: Ingreso[],
) => {
  const payload = {
    version: 3,
    exportedAt: new Date().toISOString(),
    integrantes: members,
    pagos: payments,
    donaciones: donations,
    ingresos: incomes,
    legacyImportReady: true,
  }
  download(
    new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
    `respaldo_emaus_${new Date().toISOString().slice(0, 10)}.json`,
  )
}

export const exportIngresosCsv = (incomes: Ingreso[]) => {
  const header = [
    'Movimiento N°',
    'Fecha',
    'Tipo',
    'Código',
    'Concepto',
    'Detalle / Responsable',
    'Comprobante',
    'Observación',
    'Precio Unitario',
    'Cantidad',
    'Monto Total',
  ]
  const rows = incomes.map((income) => [
    income.folio,
    income.fecha,
    income.tipo,
    income.codigo_concepto,
    income.concepto,
    income.detalle_responsable,
    income.comprobante || '',
    income.observacion || '',
    income.precio_unitario,
    income.cantidad,
    income.monto_total,
  ])
  const csv = `\ufeff${[header, ...rows].map((row) => row.map(csvCell).join(';')).join('\n')}`
  download(
    new Blob([csv], { type: 'text/csv;charset=utf-8' }),
    `ingresos_egresos_emaus_${new Date().toISOString().slice(0, 10)}.csv`,
  )
}
