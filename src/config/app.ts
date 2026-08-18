export const APP_NAME = 'Pastoral Emaús Varones PSAH'
export const MONTHLY_FEE = 3_000

export const BANK_DETAILS = {
  nombre: 'Carlos Patricio Burdiles Bravo',
  rut: '13.612.112-K',
  institucion: 'Mercado Pago',
  tipoCuenta: 'Cuenta Vista',
  numeroCuenta: '1096641654',
  correo: 'cpburdiles@gmail.com',
} as const

export const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const

export const MEMBER_STATUSES = ['Activo', 'Inactivo', 'Suspendido'] as const

export const DONATION_METHODS = [
  'Transferencia bancaria',
  'Efectivo',
  'Mercado Pago',
  'Otro',
] as const

export const getPublicAppUrl = () => {
  const configured = import.meta.env.VITE_PUBLIC_APP_URL?.trim()
  if (configured) return configured.replace(/\/$/, '')
  return typeof window === 'undefined' ? '' : window.location.origin
}
