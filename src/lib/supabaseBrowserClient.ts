import { createLazySupabaseClient } from './createLazySupabaseClient'

export const supabaseBrowser = createLazySupabaseClient(() => ({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
}))

