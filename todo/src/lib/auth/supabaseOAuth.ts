import { Platform, Alert } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../supabase'

// 無駄なセッションをクリーンアップ
WebBrowser.maybeCompleteAuthSession()

function getRedirectUri() {
  return makeRedirectUri({
    scheme: 'mobile',
    path: 'auth/callback',
  })
}

export async function signInWithGoogle() {
  const redirectTo = getRedirectUri()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    }
  })
  if (error) throw error
  if (data?.url) {
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
    return result.type
  }
  throw new Error('認証URLの取得に失敗しました')
}

export async function signOut() {
  await supabase.auth.signOut()
}
