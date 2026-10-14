import type { DONATION_METHODS, FINANCIAL_CONCEPTS, MEMBER_STATUSES } from '../config/app'

export type MemberStatus = (typeof MEMBER_STATUSES)[number]
export type DonationMethod = (typeof DONATION_METHODS)[number]
export type IncomeType = (typeof FINANCIAL_CONCEPTS)[number]['tipo']
export type IncomeConceptCode = (typeof FINANCIAL_CONCEPTS)[number]['codigo']

export interface Integrante {
  id: string
  nombre: string
  rut: string
  telefono: string | null
  email: string | null
  fecha_ingreso: string | null
  estado: MemberStatus
  direccion: string | null
  observaciones: string | null
  created_at: string
  updated_at: string
}

export type IntegranteInput = Omit<Integrante, 'id' | 'created_at' | 'updated_at'>

export interface Pago {
  id: string
  integrante_id: string
  anio: number
  mes: number
  monto: number
  fecha_pago: string
  registrado_por: string | null
  created_at: string
  updated_at: string
}

export interface PagoInput {
  integrante_id: string
  anio: number
  mes: number
  monto: number
  fecha_pago: string
}

export interface Donacion {
  id: string
  nombre_donante: string
  telefono: string | null
  email: string | null
  monto: number
  es_monetaria: boolean
  detalle_tangible: string | null
  fecha: string
  medio: DonationMethod
  observacion: string | null
  registrado_por: string | null
  created_at: string
  updated_at: string
}

export type DonacionInput = Omit<
  Donacion,
  'id' | 'registrado_por' | 'created_at' | 'updated_at'
>

export interface Ingreso {
  id: string
  folio: number
  fecha: string
  tipo: IncomeType
  codigo_concepto: IncomeConceptCode
  concepto: string
  detalle_responsable: string
  comprobante: string | null
  observacion: string | null
  precio_unitario: number
  cantidad: number
  monto_total: number
  registrado_por: string | null
  created_at: string
  updated_at: string
}

export type IngresoInput = Pick<
  Ingreso,
  | 'fecha'
  | 'tipo'
  | 'codigo_concepto'
  | 'concepto'
  | 'detalle_responsable'
  | 'comprobante'
  | 'observacion'
  | 'precio_unitario'
  | 'cantidad'
>

export interface RegistroPublicoInput {
  nombre: string
  rut: string
  telefono: string
  email: string
  fechaIngreso: string | null
  direccion: string
  observaciones: string
}

export interface PeriodFilter {
  month: number
  year: number
}
