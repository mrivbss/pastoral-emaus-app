import { useEffect, useState, type PropsWithChildren } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { checkAdminAccess } from '../services/auth'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    void supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session)
        setAuthReady(true)
      }
    })

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthReady(true)
    })

    return () => {
      mounted = false
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!authReady) return undefined
    let active = true
    if (!session) {
      setIsAdmin(false)
      setLoading(false)
      return undefined
    }

    setLoading(true)
    void checkAdminAccess().then((authorized) => {
      if (active) {
        setIsAdmin(authorized)
        setLoading(false)
      }
    })
    return () => { active = false }
  }, [authReady, session])

  return (
    <AuthContext.Provider value={{ session, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}
