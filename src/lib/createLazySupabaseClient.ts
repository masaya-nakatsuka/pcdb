import { createClient } from '@supabase/supabase-js'

// Keep the same untyped table behavior as direct createClient(url, key).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = ReturnType<typeof createClient<any>>

export function createLazySupabaseClient(urlEnvName: string, keyEnvName: string): SupabaseClient {
  let client: SupabaseClient | null = null

  function getClient(): SupabaseClient {
    if (!client) {
      const supabaseUrl = process.env[urlEnvName]
      const supabaseAnonKey = process.env[keyEnvName]

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(`${urlEnvName} または ${keyEnvName} が設定されていません`)
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
