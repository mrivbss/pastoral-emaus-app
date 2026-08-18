import { assertSupabaseConfigured, supabase } from '../lib/supabase'
import type { Integrante, IntegranteInput, RegistroPublicoInput } from '../types'

export const listIntegrantes = async () => {
  assertSupabaseConfigured()
  const { data, error } = await supabase
    .from('integrantes')
    .select('*')
    .order('nombre', { ascending: true })
  if (error) throw new Error(error.message)
  return data as Integrante[]
}

export const getIntegrante = async (id: string) => {
  assertSupabaseConfigured()
  const { data, error } = await supabase
    .from('integrantes')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return data as Integrante
}

export const createIntegrante = async (input: IntegranteInput) => {
  const { data, error } = await supabase
    .from('integrantes')
    .insert(input)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Integrante
}

export const updateIntegrante = async (id: string, input: IntegranteInput) => {
  const { data, error } = await supabase
    .from('integrantes')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Integrante
}

export const deleteIntegrante = async (id: string) => {
  const { error } = await supabase.from('integrantes').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export const registerPublicIntegrante = async (input: RegistroPublicoInput) => {
  assertSupabaseConfigured()
  const { data, error } = await supabase.rpc('registrar_integrante_publico', {
    p_nombre: input.nombre,
    p_rut: input.rut,
    p_telefono: input.telefono || null,
    p_email: input.email || null,
    p_fecha_ingreso: input.fechaIngreso,
    p_direccion: input.direccion || null,
    p_observaciones: input.observaciones || null,
  })
  if (error) throw new Error(error.message)
  return data as string
}
