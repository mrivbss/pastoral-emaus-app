export const APP_NAME = 'Pastoral Emaús Varones PSAH'
export const MONTHLY_FEE = 3_000
export const PUBLIC_APP_URL = 'https://pastoral-emaus-app.vercel.app/'

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

export const FINANCIAL_CONCEPTS = [
  { codigo: 1, nombre: 'Aporte Pago Mensual Servidor', precioUnitarioSugerido: 3_000, tipo: 'Ingreso' },
  { codigo: 2, nombre: 'Donaciones', precioUnitarioSugerido: 0, tipo: 'Ingreso' },
  { codigo: 3, nombre: 'Venta de Rifas', precioUnitarioSugerido: 15_000, tipo: 'Ingreso' },
  { codigo: 4, nombre: 'Venta de Poleras Blancas', precioUnitarioSugerido: 11_000, tipo: 'Ingreso' },
  { codigo: 5, nombre: 'Venta de Poleras Azules', precioUnitarioSugerido: 11_000, tipo: 'Ingreso' },
  { codigo: 6, nombre: 'Venta de Polerones', precioUnitarioSugerido: 0, tipo: 'Ingreso' },
  { codigo: 7, nombre: 'Venta de Calendarios 2027', precioUnitarioSugerido: 0, tipo: 'Ingreso' },
  { codigo: 8, nombre: 'Otros Ingresos', precioUnitarioSugerido: 0, tipo: 'Ingreso' },
  { codigo: 9, nombre: 'Venta de Fierritos Emaús', precioUnitarioSugerido: 2_500, tipo: 'Ingreso' },
  { codigo: 10, nombre: 'Compras de Insumos', precioUnitarioSugerido: 0, tipo: 'Egreso' },
  { codigo: 11, nombre: 'Compra Once Reunión Mensual', precioUnitarioSugerido: 0, tipo: 'Egreso' },
  { codigo: 12, nombre: 'Compra Alimento Retiro', precioUnitarioSugerido: 0, tipo: 'Egreso' },
  { codigo: 13, nombre: 'Compra Poleras Blancas', precioUnitarioSugerido: 0, tipo: 'Egreso' },
  { codigo: 14, nombre: 'Compra Poleras Azules', precioUnitarioSugerido: 0, tipo: 'Egreso' },
  { codigo: 15, nombre: 'Compra Polerones', precioUnitarioSugerido: 0, tipo: 'Egreso' },
  { codigo: 16, nombre: 'Compra Calendarios', precioUnitarioSugerido: 0, tipo: 'Egreso' },
  { codigo: 17, nombre: 'Compra Biblias', precioUnitarioSugerido: 0, tipo: 'Egreso' },
  { codigo: 18, nombre: 'Pago Casa Retiro', precioUnitarioSugerido: 0, tipo: 'Egreso' },
  { codigo: 19, nombre: 'Pago Traslado Bus', precioUnitarioSugerido: 0, tipo: 'Egreso' },
  { codigo: 20, nombre: 'Pago Bencina Traslado estacionamiento', precioUnitarioSugerido: 0, tipo: 'Egreso' },
  { codigo: 21, nombre: 'Pago Material Gráfico Retiro', precioUnitarioSugerido: 0, tipo: 'Egreso' },
  { codigo: 22, nombre: 'Aportes a traslado Servidores', precioUnitarioSugerido: 0, tipo: 'Egreso' },
  { codigo: 23, nombre: 'Apoyo Casos Especiales(Defunción, otros)', precioUnitarioSugerido: 0, tipo: 'Egreso' },
  { codigo: 24, nombre: 'Otras compras y pagos', precioUnitarioSugerido: 0, tipo: 'Egreso' },
] as const

export const INCOME_CONCEPTS = FINANCIAL_CONCEPTS.filter(
  (concept) => concept.tipo === 'Ingreso',
)

export const EXPENSE_CONCEPTS = FINANCIAL_CONCEPTS.filter(
  (concept) => concept.tipo === 'Egreso',
)

export const getPublicAppUrl = () => PUBLIC_APP_URL
