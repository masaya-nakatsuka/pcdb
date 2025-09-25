import { useEffect, useState } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'

interface UseAuthOptions {
  redirectPath: string
}

export function useAuth(supabaseClient: SupabaseClient, options: UseAuthOptions) {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data } = await supabaseClient.auth.getUser()
      if (!mounted) return
      const uid = data.user?.id ?? null
      setUserId(uid)
      setLoading(false)
    })()
    return () => { mounted = false }
  }, [supabaseClient])

  const signIn = async () => {
    await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${options.redirectPath}`,
      },
    })
  }

  const signOut = async () => {
    await supabaseClient.auth.signOut()
    setUserId(null)
  }

  return {
    userId,
    loading,
    signIn,
    signOut,
  }
}