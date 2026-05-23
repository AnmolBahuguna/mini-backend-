import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment (.env.local).'
  )
}

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null

export async function getSupabaseAccessToken(): Promise<string | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Supabase session error:', error)
      return null
    }
    return data.session?.access_token ?? null
  } catch (error) {
    console.error('Failed to get Supabase session:', error)
    return null
  }
}
