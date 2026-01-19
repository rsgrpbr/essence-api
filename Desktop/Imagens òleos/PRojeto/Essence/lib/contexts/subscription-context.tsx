"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"

type UserTier = "free" | "premium"

// ← ATUALIZADO: Adicionados campos de aceite de termos
interface Profile {
  id: string
  email: string
  full_name: string
  subscription_tier: UserTier
  subscription_plan: string | null
  stripe_customer_id: string | null
  accepted_terms: boolean
  terms_accepted_at: string | null
  terms_version: string | null
}

interface SubscriptionContextType {
  userTier: UserTier
  isLoggedIn: boolean
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isInitialized: boolean
  refreshProfile: () => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  isMobile: boolean
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

// Helper para extrair tier do JWT/session
function getTierFromSession(session: Session | null): UserTier {
  if (!session?.user) return "free"
  
  // Primeiro tenta user_metadata (mais confiável, atualizado pelo webhook)
  const metadataTier = session.user.user_metadata?.subscription_tier
  if (metadataTier === "premium" || metadataTier === "free") {
    console.log("🎫 [CONTEXT] Tier do JWT metadata:", metadataTier)
    return metadataTier
  }
  
  return "free"
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userTier, setUserTier] = useState<UserTier>("free")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0)
  const [isMobile, setIsMobile] = useState(false)
  const [currentSession, setCurrentSession] = useState<Session | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      setIsMobile(mobile)
      console.log("[MOBILE] Detectado:", mobile)
    }
  }, [])

  const supabase = useMemo(() => {
    try {
      const client = getSupabaseClient()
      console.log("🔧 [CONTEXT] Supabase client loaded")
      return client
    } catch (error) {
      console.error("❌ [CONTEXT] Failed to create Supabase client:", error)
      return null
    }
  }, [])

  const loadProfileFromDB = useCallback(
    async (userId: string, fallbackTier?: UserTier): Promise<Profile | null> => {
      if (!supabase) return null

      console.log("🔄 [CONTEXT] Buscando perfil do BANCO para:", userId)
      console.log("🔄 [CONTEXT] Fallback tier (do JWT):", fallbackTier)

      try {
        // Timeout de 5 segundos para mobile
        const timeoutMs = isMobile ? 5000 : 10000
        
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), timeoutMs)
        )

        const queryPromise = supabase
          .from("profiles")
          .select("id, email, full_name, subscription_tier, subscription_plan, stripe_customer_id")
          .eq("id", userId)
          .single()

        const { data, error } = await Promise.race([queryPromise, timeoutPromise])

        if (error) {
          console.error("❌ [CONTEXT] Erro ao buscar perfil:", error.message)
          // Se temos fallback do JWT, criar profile sintético
          if (fallbackTier) {
            console.log("⚠️ [CONTEXT] Usando tier do JWT como fallback:", fallbackTier)
            return {
              id: userId,
              email: "",
              full_name: "",
              subscription_tier: fallbackTier,
              subscription_plan: null,
              stripe_customer_id: null,
              accepted_terms: false,
              terms_accepted_at: null,
              terms_version: null,
            }
          }
          return null
        }

        if (!data) {
          console.error("❌ [CONTEXT] Perfil não encontrado")
          if (fallbackTier) {
            console.log("⚠️ [CONTEXT] Usando tier do JWT como fallback:", fallbackTier)
            return {
              id: userId,
              email: "",
              full_name: "",
              subscription_tier: fallbackTier,
              subscription_plan: null,
              stripe_customer_id: null,
              accepted_terms: false,
              terms_accepted_at: null,
              terms_version: null,
            }
          }
          return null
        }

        const dbTier = data.subscription_tier || "free"
        console.log("✅ [CONTEXT] Perfil do banco - tier:", dbTier)

        return data as Profile
      } catch (err: any) {
        console.error("❌ [CONTEXT] Exception ao buscar perfil:", err?.message || err)
        // Se temos fallback do JWT, usar ele
        if (fallbackTier) {
          console.log("⚠️ [CONTEXT] Query falhou - usando tier do JWT:", fallbackTier)
          return {
            id: userId,
            email: "",
            full_name: "",
            subscription_tier: fallbackTier,
            subscription_plan: null,
            stripe_customer_id: null,
            accepted_terms: false,
            terms_accepted_at: null,
            terms_version: null,
          }
        }
        return null
      }
    },
    [supabase, isMobile],
  )

  const refreshProfile = useCallback(async () => {
    if (!user?.id) {
      console.log("⚠️ [CONTEXT] refreshProfile: sem user")
      return
    }

    const now = Date.now()
    const debounceTime = isMobile ? 2000 : 3000
    if (now - lastRefreshTime < debounceTime) {
      console.log("⏳ [CONTEXT] Refresh ignorado - debounce ativo")
      return
    }
    setLastRefreshTime(now)

    console.log("🔄 [CONTEXT] Refresh manual do perfil...")
    
    // Pegar tier do JWT como fallback
    const jwtTier = getTierFromSession(currentSession)
    
    const freshProfile = await loadProfileFromDB(user.id, jwtTier)

    if (freshProfile) {
      setProfile(freshProfile)
      setUserTier(freshProfile.subscription_tier)
      console.log("✅ [CONTEXT] Perfil atualizado para:", freshProfile.subscription_tier)
    }
  }, [user?.id, lastRefreshTime, loadProfileFromDB, isMobile, currentSession])

  useEffect(() => {
    if (!supabase) {
      console.error("❌ [CONTEXT] Supabase não disponível")
      setUserTier("free")
      setIsLoggedIn(false)
      setIsLoading(false)
      setIsInitialized(true)
      return
    }

    let mounted = true
    console.log("🚀 [CONTEXT] Inicializando auth...")

    const initializeAuth = async () => {
      try {
        console.log("🔐 [CONTEXT] Buscando sessão...")

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("❌ [CONTEXT] Erro ao buscar sessão:", error)
          if (mounted) {
            setUserTier("free")
            setIsLoggedIn(false)
            setIsLoading(false)
            setIsInitialized(true)
          }
          return
        }

        if (!session?.user) {
          console.log("ℹ️ [CONTEXT] Sem sessão - usando free")
          if (mounted) {
            setUserTier("free")
            setIsLoggedIn(false)
            setIsLoading(false)
            setIsInitialized(true)
          }
          return
        }

        console.log("✅ [CONTEXT] Sessão encontrada:", session.user.email)

        // Extrair tier do JWT IMEDIATAMENTE
        const jwtTier = getTierFromSession(session)
        console.log("🎫 [CONTEXT] Tier do JWT:", jwtTier)

        if (mounted) {
          setUser(session.user)
          setCurrentSession(session)
          setIsLoggedIn(true)
          // Definir tier do JWT imediatamente (não esperar query)
          setUserTier(jwtTier)
        }

        // Tentar buscar do banco em background (com fallback pro JWT)
        const profileData = await loadProfileFromDB(session.user.id, jwtTier)

        if (mounted) {
          if (profileData) {
            setProfile(profileData)
            // Só atualiza tier se veio do banco e é diferente
            if (profileData.subscription_tier) {
              setUserTier(profileData.subscription_tier)
              console.log("✅ [CONTEXT] Tier final:", profileData.subscription_tier)
            }
          }
          setIsLoading(false)
          setIsInitialized(true)
        }
      } catch (error) {
        console.error("❌ [CONTEXT] Exception:", error)
        if (mounted) {
          setUserTier("free")
          setIsLoggedIn(false)
          setIsLoading(false)
          setIsInitialized(true)
        }
      }
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("📡 [AUTH] Event:", event)

      if (!mounted) return

      if (event === "SIGNED_IN" && session?.user) {
        console.log("✅ [AUTH] Login detectado")
        
        // Extrair tier do JWT IMEDIATAMENTE
        const jwtTier = getTierFromSession(session)
        console.log("🎫 [AUTH] Tier do JWT:", jwtTier)
        
        setUser(session.user)
        setCurrentSession(session)
        setIsLoggedIn(true)
        setUserTier(jwtTier) // Definir imediatamente!

        // Buscar do banco em background
        const profileData = await loadProfileFromDB(session.user.id, jwtTier)
        if (mounted && profileData) {
          setProfile(profileData)
          setUserTier(profileData.subscription_tier)
        }
        
        setIsLoading(false)
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        console.log("🔄 [AUTH] Token refreshed")
        
        const jwtTier = getTierFromSession(session)
        setUser(session.user)
        setCurrentSession(session)
        setUserTier(jwtTier)

        const profileData = await loadProfileFromDB(session.user.id, jwtTier)
        if (mounted && profileData) {
          setProfile(profileData)
          setUserTier(profileData.subscription_tier)
        }
      } else if (event === "SIGNED_OUT") {
        console.log("🚪 [AUTH] Logout")
        setUser(null)
        setCurrentSession(null)
        setProfile(null)
        setUserTier("free")
        setIsLoggedIn(false)
      } else if (event === "USER_UPDATED" && session?.user) {
        console.log("🔄 [AUTH] User updated")
        
        const jwtTier = getTierFromSession(session)
        setUser(session.user)
        setCurrentSession(session)
        setUserTier(jwtTier)

        const profileData = await loadProfileFromDB(session.user.id, jwtTier)
        if (mounted && profileData) {
          setProfile(profileData)
          setUserTier(profileData.subscription_tier)
        }
      }
    })

    // Handlers simplificados - usam JWT como fonte primária
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible" && user?.id && mounted) {
        const now = Date.now()
        if (now - lastRefreshTime < 2000) return
        
        console.log(`👁️ [VISIBILITY] Janela visível - verificando sessão...`)
        setLastRefreshTime(now)

        // Verificar se sessão ainda existe
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          const jwtTier = getTierFromSession(session)
          console.log("🎫 [VISIBILITY] Tier do JWT:", jwtTier)
          setCurrentSession(session)
          setUserTier(jwtTier)
          
          // Tentar atualizar do banco em background
          const freshProfile = await loadProfileFromDB(session.user.id, jwtTier)
          if (mounted && freshProfile) {
            setProfile(freshProfile)
            setUserTier(freshProfile.subscription_tier)
          }
        } else {
          console.log("⚠️ [VISIBILITY] Sessão perdida")
          setUser(null)
          setCurrentSession(null)
          setProfile(null)
          setUserTier("free")
          setIsLoggedIn(false)
        }
      }
    }

    const handleFocus = async () => {
      if (user?.id && mounted) {
        const now = Date.now()
        if (now - lastRefreshTime < 2000) return
        
        console.log(`🎯 [FOCUS] Window focus - verificando sessão...`)
        setLastRefreshTime(now)

        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          const jwtTier = getTierFromSession(session)
          console.log("🎫 [FOCUS] Tier do JWT:", jwtTier)
          setCurrentSession(session)
          setUserTier(jwtTier)
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)

    return () => {
      mounted = false
      subscription.unsubscribe()
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
    }
  }, [supabase, loadProfileFromDB, isMobile])

  // ← SIMPLIFICADO: Trigger SQL agora cria profile automaticamente com aceite
  const signUp = async (email: string, password: string, fullName: string) => {
    if (!supabase) {
      return { error: new Error("Supabase não configurado") }
    }

    try {
      console.log("📝 [SIGNUP] Registrando:", email)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            subscription_tier: "free",
          },
        },
      })

      if (error) {
        console.error("❌ [SIGNUP] Erro:", error)
        return { error }
      }

      if (!data.user) {
        console.error("❌ [SIGNUP] Usuário não criado")
        return { error: new Error("Erro ao criar usuário") }
      }

      // ✅ O trigger SQL já cria o profile automaticamente com:
      //    - accepted_terms = true
      //    - terms_accepted_at = NOW()
      //    - terms_version = '1.0'
      console.log("✅ [SIGNUP] Sucesso - profile será criado automaticamente pelo trigger")
      
      return { error: null }
    } catch (error) {
      console.error("❌ [SIGNUP] Exception:", error)
      return { error: error as Error }
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error("Supabase não configurado") }
    }

    try {
      console.log("🔐 [SIGNIN] Entrando...")
      setIsLoading(true)

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        console.error("❌ [SIGNIN] Erro:", error.message)
        setIsLoading(false)
        return { error }
      }

      if (!data.user || !data.session) {
        setIsLoading(false)
        return { error: new Error("Erro ao fazer login") }
      }

      console.log("✅ [SIGNIN] Sucesso:", data.user.email)

      // Extrair tier do JWT IMEDIATAMENTE
      const jwtTier = getTierFromSession(data.session)
      console.log("🎫 [SIGNIN] Tier do JWT:", jwtTier)

      setUser(data.user)
      setCurrentSession(data.session)
      setIsLoggedIn(true)
      setUserTier(jwtTier) // Definir imediatamente!

      // Buscar do banco em background
      const profileData = await loadProfileFromDB(data.user.id, jwtTier)
      if (profileData) {
        setProfile(profileData)
        setUserTier(profileData.subscription_tier)
      }

      setIsLoading(false)
      return { error: null }
    } catch (error) {
      console.error("❌ [SIGNIN] Exception:", error)
      setIsLoading(false)
      return { error: error as Error }
    }
  }

  // ← CORRIGIDO: signOut agora vai para raiz "/" ao invés de "/login"
  const signOut = async () => {
    if (!supabase) {
      window.location.href = "/"
      return
    }

    try {
      console.log("🚪 [LOGOUT] Saindo...")

      setUser(null)
      setCurrentSession(null)
      setProfile(null)
      setUserTier("free")
      setIsLoggedIn(false)

      await supabase.auth.signOut()

      console.log("✅ [LOGOUT] Sucesso - redirecionando para raiz")
      window.location.href = "/"
    } catch (error) {
      console.error("❌ [LOGOUT] Erro:", error)
      window.location.href = "/"
    }
  }

  return (
    <SubscriptionContext.Provider
      value={{
        userTier,
        isLoggedIn,
        user,
        profile,
        isLoading,
        isInitialized,
        refreshProfile,
        signUp,
        signIn,
        signOut,
        isMobile,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider")
  }
  return context
}
