import { createClient } from '@supabase/supabase-js'

// Intentar leer las variables desde .env de Vite o desde localStorage (para configuración en caliente)
const envUrl = import.meta.env.VITE_SUPABASE_URL || ''
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const storedUrl = localStorage.getItem('preco_supabase_url') || ''
const storedKey = localStorage.getItem('preco_supabase_key') || ''

export const supabaseUrl = storedUrl || envUrl
export const supabaseAnonKey = storedKey || envKey

export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('tu-proyecto') &&
    !supabaseAnonKey.includes('tu-clave')
  )
}

export let supabase = null

if (isSupabaseConfigured()) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  } catch (err) {
    console.error('Error al inicializar cliente Supabase:', err)
  }
}

export const updateSupabaseCredentials = (url, key) => {
  if (url && key) {
    localStorage.setItem('preco_supabase_url', url.trim())
    localStorage.setItem('preco_supabase_key', key.trim())
  } else {
    localStorage.removeItem('preco_supabase_url')
    localStorage.removeItem('preco_supabase_key')
  }
  window.location.reload()
}
