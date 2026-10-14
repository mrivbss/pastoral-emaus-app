import { supabase } from '../lib/supabase'
import type { Donacion, DonacionInput } from '../types'

const normalizeDonation = (donation: Donacion) => ({
  ...donation,
  es_monetaria: donation.es_monetaria !== false,
  detalle_tangible: donation.detalle_tangible || null,
})

export const listDonaciones = async () => {
  const { data, error } = await supabase
    .from('donaciones')
    .select('*')
    .order('fecha', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as Donacion[]).map(normalizeDonation)
}

export const createDonacion = async (input: DonacionInput) => {
  const { data, error } = await supabase
    .from('donaciones')
    .insert(input)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return normalizeDonation(data as Donacion)
}

export const updateDonacion = async (id: string, input: DonacionInput) => {
  const { data, error } = await supabase
    .from('donaciones')
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return normalizeDonation(data as Donacion)
}

export const deleteDonacion = async (id: string) => {
  const { error } = await supabase.from('donaciones').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
