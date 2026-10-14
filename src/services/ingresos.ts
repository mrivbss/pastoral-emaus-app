import { supabase } from '../lib/supabase'
import type { Ingreso, IngresoInput } from '../types'

const throwIfError = (error: { message: string } | null) => {
  if (error) throw new Error(error.message)
}

export const listIngresos = async () => {
  const { data, error } = await supabase
    .from('ingresos')
    .select('*')
    .order('fecha', { ascending: false })
    .order('folio', { ascending: false })
  throwIfError(error)
  return data as Ingreso[]
}

export const createIngresosBatch = async (inputs: IngresoInput[]) => {
  if (!inputs.length) return []
  const { data, error } = await supabase.from('ingresos').insert(inputs).select()
  throwIfError(error)
  return data as Ingreso[]
}

export const updateIngreso = async (id: string, input: IngresoInput) => {
  const { data, error } = await supabase
    .from('ingresos')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  throwIfError(error)
  return data as Ingreso
}

export const deleteIngreso = async (id: string) => {
  const { error } = await supabase.from('ingresos').delete().eq('id', id)
  throwIfError(error)
}

export const isMissingIngresosTableError = (caught: unknown) => {
  const message = caught instanceof Error ? caught.message : String(caught)
  return (
    /ingresos/i.test(message) &&
    /(schema cache|could not find|does not exist|no existe|PGRST205)/i.test(message)
  )
}
