import { supabase } from '../lib/supabase'
import type { Pago, PagoInput } from '../types'

export const listPagos = async (year: number, integranteId?: string) => {
  let query = supabase
    .from('pagos')
    .select('*')
    .eq('anio', year)
    .order('mes', { ascending: true })

  if (integranteId) query = query.eq('integrante_id', integranteId)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data as Pago[]
}

export const listAllPagos = async () => {
  const { data, error } = await supabase
    .from('pagos')
    .select('*')
    .order('anio', { ascending: true })
    .order('mes', { ascending: true })
  if (error) throw new Error(error.message)
  return data as Pago[]
}

export const createPago = async (input: PagoInput) => {
  const { data, error } = await supabase.from('pagos').insert(input).select().single()
  if (error) throw new Error(error.message)
  return data as Pago
}

export const updatePago = async (id: string, input: Pick<PagoInput, 'monto' | 'fecha_pago'>) => {
  const { data, error } = await supabase
    .from('pagos')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Pago
}

export const deletePago = async (id: string) => {
  const { error } = await supabase.from('pagos').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
