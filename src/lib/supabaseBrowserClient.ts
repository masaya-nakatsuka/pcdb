import { createLazySupabaseClient } from './createLazySupabaseClient'

export const supabaseBrowser = createLazySupabaseClient(
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
)

