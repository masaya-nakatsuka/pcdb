import { createClient } from '@supabase/supabase-js'

type SupabaseClient = ReturnType<typeof createClient>

let supabaseClient: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase環境変数が設定されていません')
    }

    supabaseClient = createClient(supabaseUrl, supabaseServiceKey)
  }

  return supabaseClient
}
