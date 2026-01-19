import { createBrowserClient } from "@supabase/ssr"

const isMobile = typeof window !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
const isPWA =
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true)

// Storage key consistente
const STORAGE_KEY = "essence-auth"
const BACKUP_KEY = "essence-auth-backup"

/**
 * Storage adapter robusto que:
 * 1. Usa localStorage como primário
 * 2. Mantém backup em sessionStorage
 * 3. Tenta recuperar de ambos em caso de perda
 */
const getRobustStorageAdapter = () => {
  if (typeof window === "undefined") return undefined

  console.log(`[v0] 📱 Mobile: ${isMobile}, PWA: ${isPWA}`)

  return {
    getItem: (key: string) => {
      try {
        // Primeiro tenta localStorage
        let value = localStorage.getItem(key)
        
        if (value) {
          console.log(`[v0] 📖 Storage GET ${key}: found in localStorage`)
          // Garante backup no sessionStorage
          try {
            sessionStorage.setItem(BACKUP_KEY, value)
          } catch {}
          return value
        }

        // Se não encontrou no localStorage, tenta sessionStorage (backup)
        const backupValue = sessionStorage.getItem(BACKUP_KEY)
        if (backupValue && key === STORAGE_KEY) {
          console.log(`[v0] 📖 Storage GET ${key}: RECOVERED from sessionStorage backup!`)
          // Restaura no localStorage
          try {
            localStorage.setItem(key, backupValue)
          } catch {}
          return backupValue
        }

        console.log(`[v0] 📖 Storage GET ${key}: not found`)
        return null
      } catch (e) {
        console.error("[v0] [STORAGE] Erro ao ler:", e)
        return null
      }
    },
    setItem: (key: string, value: string) => {
      try {
        localStorage.setItem(key, value)
        console.log(`[v0] 💾 Storage SET ${key}: saved to localStorage`)
        
        // Sempre mantém backup no sessionStorage
        if (key === STORAGE_KEY) {
          try {
            sessionStorage.setItem(BACKUP_KEY, value)
            console.log(`[v0] 💾 Storage SET ${key}: backup saved to sessionStorage`)
          } catch {}
        }
      } catch (e) {
        console.error("[v0] [STORAGE] Erro ao salvar:", e)
      }
    },
    removeItem: (key: string) => {
      try {
        localStorage.removeItem(key)
        console.log(`[v0] 🗑️ Storage REMOVE ${key}: removed from localStorage`)
        
        // Também remove o backup
        if (key === STORAGE_KEY) {
          try {
            sessionStorage.removeItem(BACKUP_KEY)
          } catch {}
        }
      } catch (e) {
        console.error("[v0] [STORAGE] Erro ao remover:", e)
      }
    },
  }
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ""

  if (!supabaseUrl || supabaseUrl.trim() === "" || !supabaseUrl.startsWith("http")) {
    if (typeof window !== "undefined" && !window.__supabase_env_warning) {
      console.warn(
        "⚠️ Supabase não configurado. Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY na seção Vars.\n" +
          "Enquanto isso, o app funcionará em modo somente-leitura (free tier).",
      )
      window.__supabase_env_warning = true
    }
    return createBrowserClient("https://placeholder.supabase.co", "placeholder-key", {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }

  if (!supabaseAnonKey || supabaseAnonKey.trim() === "") {
    if (typeof window !== "undefined" && !window.__supabase_env_warning) {
      console.warn("⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada.")
      window.__supabase_env_warning = true
    }
    return createBrowserClient(supabaseUrl, "placeholder-key", {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }

  console.log(`[v0] ✅ [SUPABASE] Criando cliente (${isPWA ? "PWA" : isMobile ? "Mobile" : "Desktop"})`)
  console.log(`[v0] 🔗 [SUPABASE] URL: ${supabaseUrl.substring(0, 50)}...`)
  console.log(`[v0] 🔑 [SUPABASE] Key: ${supabaseAnonKey.substring(0, 20)}...`)

  // Usar storage adapter robusto para TODOS os casos (não só mobile)
  const storageAdapter = getRobustStorageAdapter()

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true, // Sempre detectar, importante para redirects
      flowType: "pkce",
      storage: storageAdapter,
      storageKey: STORAGE_KEY,
      debug: isMobile || isPWA, // Debug apenas em mobile/PWA
    },
    global: {
      headers: {
        "X-Client-Info": `essence-app-${isPWA ? "pwa" : isMobile ? "mobile" : "desktop"}`,
      },
    },
    realtime: {
      params: {
        eventsPerSecond: isMobile || isPWA ? 1 : 10,
      },
    },
  })
}

let supabaseInstance: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient()
  }
  return supabaseInstance
}

// Função auxiliar para verificar/recuperar sessão manualmente
export async function ensureSession() {
  const client = getSupabaseClient()
  
  // Primeiro tenta pegar sessão normalmente
  const { data: { session }, error } = await client.auth.getSession()
  
  if (session) {
    console.log("[v0] ✅ Sessão válida encontrada")
    return session
  }

  // Se não tem sessão, tenta recuperar do backup
  const backup = sessionStorage.getItem(BACKUP_KEY)
  if (backup) {
    console.log("[v0] 🔄 Tentando recuperar sessão do backup...")
    try {
      const parsed = JSON.parse(backup)
      if (parsed?.access_token && parsed?.refresh_token) {
        const { data, error: refreshError } = await client.auth.setSession({
          access_token: parsed.access_token,
          refresh_token: parsed.refresh_token,
        })
        if (data?.session) {
          console.log("[v0] ✅ Sessão recuperada do backup!")
          return data.session
        }
      }
    } catch (e) {
      console.error("[v0] ❌ Erro ao recuperar sessão:", e)
    }
  }

  console.log("[v0] ⚠️ Nenhuma sessão encontrada")
  return null
}
