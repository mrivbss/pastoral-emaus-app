/** Estructuras de lectura para una futura importación explícita de respaldos V1. */
export interface LegacyPayment {
  fecha: string
  monto: number
}

export interface LegacyMember {
  id?: string
  nombre: string
  rut?: string
  telefono?: string
  email?: string
  fechaIngreso?: string
  estadoIntegrante?: string
  direccion?: string
  observaciones?: string
  pagos?: Record<string, LegacyPayment>
}

export interface LegacyDonation {
  id?: string
  nombre?: string
  telefono?: string
  email?: string
  monto: number
  fecha: string
  medio?: string
  observacion?: string
}

export interface LegacyBackup {
  personas: LegacyMember[]
  donaciones?: LegacyDonation[]
  fechaRespaldo?: string
}
