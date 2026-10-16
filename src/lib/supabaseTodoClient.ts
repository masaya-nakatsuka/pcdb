import { createLazySupabaseClient } from './createLazySupabaseClient'

export const supabaseTodo = createLazySupabaseClient(() => ({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL_NOTES,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_NOTES,
}))
