import { APP_NAME, BANK_DETAILS, MONTHLY_FEE, MONTHS, getPublicAppUrl } from '../config/app'
import type { Ingreso } from '../types'
import { formatCurrency, formatDate } from './format'

export const normalizeChileanPhone = (phone: string | null) => {
  let digits = (phone || '').replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.startsWith('56')) return digits
  if (digits.startsWith('0')) digits = digits.slice(1)
  if (digits.length === 9 && digits.startsWith('9')) return `56${digits}`
  if (digits.length === 8) return `569${digits}`
  return digits
}

export const paymentMessage = (
  name: string,
  month: number,
  year: number,
  paid: boolean,
) => {
  if (paid) {
    return `Hola ${name}.\n\nTe informamos que tu cuota de ${MONTHS[month - 1]} ${year}, correspondiente a ${formatCurrency(MONTHLY_FEE)}, se encuentra PAGADA.\n\nMuchas gracias por tu compromiso con la ${APP_NAME}.`
  }

  return `Hola ${name}.\n\nTe recordamos que tu cuota de ${MONTHS[month - 1]} ${year}, correspondiente a ${formatCurrency(MONTHLY_FEE)}, se encuentra pendiente de pago.\n\nPuedes realizar la transferencia a:\n\n${BANK_DETAILS.nombre}\nRUT: ${BANK_DETAILS.rut}\n${BANK_DETAILS.institucion}\n${BANK_DETAILS.tipoCuenta}\nN° de cuenta: ${BANK_DETAILS.numeroCuenta}\nCorreo: ${BANK_DETAILS.correo}\n\nMuchas gracias por tu compromiso con la ${APP_NAME}.`
}

export const shareAppMessage = () => {
  const url = getPublicAppUrl()
  return `Hola. Te compartimos la App de la ${APP_NAME} para consultar la cuota mensual y los datos para realizar pagos o donaciones.\n\nCuota mensual: ${formatCurrency(MONTHLY_FEE)}\n\nDatos para transferencia:\n${BANK_DETAILS.nombre}\nRUT: ${BANK_DETAILS.rut}\n${BANK_DETAILS.institucion}\n${BANK_DETAILS.tipoCuenta}\nN° de cuenta: ${BANK_DETAILS.numeroCuenta}\nCorreo: ${BANK_DETAILS.correo}\n\nAccede a la App aquí:\n${url}\n\nMuchas gracias por tu compromiso y colaboración con Emaús Varones PSAH.`
}

export const whatsappUrl = (message: string, phone?: string | null) => {
  const normalized = normalizeChileanPhone(phone || '')
  const base = normalized ? `https://wa.me/${normalized}` : 'https://wa.me/'
  return `${base}?text=${encodeURIComponent(message)}`
}

export const incomeReceiptMessage = (income: Ingreso) => {
  const reference = income.comprobante?.trim() || `Movimiento ${income.folio}`
  const detail = [income.detalle_responsable, income.observacion]
    .filter(Boolean)
    .join(' — ')
  return [
    'PARROQUIA SAN ALBERTO HURTADO DE TALCA',
    'PASTORAL EMAÚS VARONES PSAH',
    '',
    `COMPROBANTE DE ${income.tipo.toUpperCase()}`,
    `Movimiento N°: ${income.folio}`,
    `N° Comprobante / Referencia: ${reference}`,
    `Fecha: ${formatDate(income.fecha)}`,
    `Concepto: [#${String(income.codigo_concepto).padStart(2, '0')}] ${income.concepto}`,
    `Detalle / Responsable: ${detail}`,
    `Precio Unitario: ${formatCurrency(income.precio_unitario)}`,
    `Cantidad: ${income.cantidad}`,
    `MONTO TOTAL: ${formatCurrency(income.monto_total)}`,
  ].join('\n')
}
