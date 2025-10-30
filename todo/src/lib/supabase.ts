import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL_NOTES ?? (() => {
  throw new Error('SUPABASE_URL が取得できません')
})

const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY_NOTES ?? (() => {
  throw new Error('SUPABASE_ANON_KEY が取得できません')
})

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  }
})
