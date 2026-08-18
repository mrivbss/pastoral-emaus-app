import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = createClient(
  supabaseUrl || 'https://configuracion-pendiente.supabase.co',
  supabaseAnonKey || 'configuracion-pendiente',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)

export const assertSupabaseConfigured = () => {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Falta configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.',
    )
  }
}
