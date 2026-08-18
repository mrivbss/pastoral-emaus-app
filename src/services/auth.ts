import { assertSupabaseConfigured, supabase } from '../lib/supabase'

export const signIn = async (email: string, password: string) => {
  assertSupabaseConfigured()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error('Correo o contraseña incorrectos.')
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}

export const checkAdminAccess = async () => {
  const { data, error } = await supabase.rpc('es_administrador')
  if (error) return false
  return data === true
}
