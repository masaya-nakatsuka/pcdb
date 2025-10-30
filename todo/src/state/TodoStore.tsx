"use client"

import { Alert } from 'react-native'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'

import { supabase } from '../lib/supabase'
import { signInWithGoogle } from '../lib/auth/supabaseOAuth'

type AppContextValue = {
  session: Session | null
  user: User | null
  loadingUser: boolean
  selectedListId: string | null
  selectList(listId: string | null): void
  signIn(): Promise<void>
  signOut(): Promise<void>
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export function TodoProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [selectedListId, setSelectedListId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoadingUser(false)
    })()

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setLoadingUser(false)
    })

    return () => {
      mounted = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const selectList = useCallback((listId: string | null) => {
    setSelectedListId(listId)
  }, [])

  const signIn = useCallback(async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('サインインに失敗しました:', error)
      Alert.alert('サインインに失敗しました', (error as Error).message)
    }
  }, [])
  
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
    setSelectedListId(null)
  }, [])

  const value = useMemo<AppContextValue>(
    () => ({
      session,
      user,
      loadingUser,
      selectedListId,
      selectList,
      signIn,
      signOut
    }),
    [session, user, loadingUser, selectedListId, selectList, signIn, signOut]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useTodoStore() {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error('useTodoStore must be used within a TodoProvider')
  }
  return ctx
}
