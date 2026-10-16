import { createClient } from '@supabase/supabase-js'

// Keep the same untyped table behavior as direct createClient(url, key).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = ReturnType<typeof createClient<any>>

type PublicSupabaseConfig = {
  url: string | undefined
  anonKey: string | undefined
}

export function createLazySupabaseClient(readConfig: () => PublicSupabaseConfig): SupabaseClient {
  let client: SupabaseClient | null = null

  function getClient(): SupabaseClient {
    if (!client) {
      const { url: supabaseUrl, anonKey: supabaseAnonKey } = readConfig()

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabaseの公開接続設定がありません')
      }

      client = createClient(supabaseUrl, supabaseAnonKey)
    }

    return client
  }

  return new Proxy({} as SupabaseClient, {
    get(_target, prop) {
      const activeClient = getClient()
      const value = activeClient[prop as keyof SupabaseClient]

      if (typeof value === 'function') {
        return value.bind(activeClient)
      }

      return value
    },
  })
}
