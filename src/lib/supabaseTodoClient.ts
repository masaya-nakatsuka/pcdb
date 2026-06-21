import { createLazySupabaseClient } from './createLazySupabaseClient'

export const supabaseTodo = createLazySupabaseClient(
  'NEXT_PUBLIC_SUPABASE_URL_NOTES',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY_NOTES'
)
