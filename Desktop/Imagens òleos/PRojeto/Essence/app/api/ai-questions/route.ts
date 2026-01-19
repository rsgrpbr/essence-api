import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const FREE_TIER_LIMIT = 30

// Criar cliente Supabase com Service Role Key
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Função para extrair o user ID dos cookies chunked do Supabase
async function getUserIdFromCookies() {
  const cookieStore = await cookies()
  
  // DEBUG: Listar TODOS os cookies
  const allCookies = cookieStore.getAll()
  console.log('=== DEBUG: COOKIES RECEBIDOS ===')
  console.log(`Total de cookies: ${allCookies.length}`)
  allCookies.forEach(c => {
    const preview = c.value.length > 80 ? c.value.substring(0, 80) + '...' : c.value
    console.log(`  ${c.name}: ${preview}`)
  })
  console.log('================================')
  
  // Variável para armazenar o valor do cookie
  let combinedValue = ''
  
  // Tentar primeiro o cookie simples (essence-auth)
  let singleCookie = cookieStore.get('essence-auth')
  
  if (singleCookie && singleCookie.value) {
    console.log(`✅ Cookie 'essence-auth' encontrado (${singleCookie.value.length} chars)`)
    combinedValue = singleCookie.value
  } else {
    console.log(`Cookie 'essence-auth' não encontrado, tentando chunks...`)
    
    // Tentar cookies chunked: essence-auth.0, essence-auth.1, etc
    let chunkIndex = 0
    
    while (true) {
      const chunk = cookieStore.get(`essence-auth.${chunkIndex}`)
      console.log(`Chunk ${chunkIndex}:`, chunk ? `ENCONTRADO (${chunk.value.length} chars)` : 'NÃO ENCONTRADO')
      if (!chunk || !chunk.value) break
      combinedValue += chunk.value
      chunkIndex++
    }
    
    console.log(`Total de chunks combinados: ${chunkIndex}`)
  }
  
  console.log(`Tamanho do valor final: ${combinedValue.length}`)
  
  if (!combinedValue) {
    console.log("❌ Nenhum cookie de autenticação encontrado")
    return null
  }

  try {
    // Remover prefixo 'base64-' se existir
    const base64Value = combinedValue.replace(/^base64-/, '')
    console.log(`Após remover 'base64-', tamanho: ${base64Value.length}`)
    
    // Decodificar base64
    const decoded = Buffer.from(base64Value, 'base64').toString('utf-8')
    console.log(`Decodificado com sucesso, tamanho: ${decoded.length}`)
    
    const authData = JSON.parse(decoded)
    console.log(`JSON parseado, tem user?`, !!authData.user)
    
    // Pegar user ID
    const userId = authData.user?.id
    
    if (!userId) {
      console.log("❌ User ID não encontrado no authData")
      return null
    }
    
    console.log(`✅ User ID extraído: ${userId}`)
    return userId
  } catch (error) {
    console.error("❌ Erro ao processar cookie:", error)
    console.error("Stack:", error instanceof Error ? error.stack : 'N/A')
    return null
  }
}

export async function GET() {
  try {
    const userId = await getUserIdFromCookies()

    if (!userId) {
      console.log("GET /api/ai-questions - Usuário não autenticado")
      // Retorna valores padrão para não autenticado
      return NextResponse.json({
        isPremium: false,
        questionsUsed: 0,
        questionsRemaining: FREE_TIER_LIMIT,
        canAsk: true,
        showWarning: false,
        limit: FREE_TIER_LIMIT,
        authenticated: false,
      })
    }

    console.log(`GET /api/ai-questions - User ID: ${userId}`)

    const supabase = getSupabaseAdmin()

    // Buscar perfil
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("subscription_tier, ai_questions_used")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("GET /api/ai-questions - Erro ao buscar perfil:", error)
      
      // Retorna valores padrão seguros
      return NextResponse.json({
        isPremium: false,
        questionsUsed: 0,
        questionsRemaining: FREE_TIER_LIMIT,
        canAsk: true,
        showWarning: false,
        limit: FREE_TIER_LIMIT,
        error: "Erro ao buscar dados",
      })
    }

    if (!profile) {
      console.log("GET /api/ai-questions - Perfil não encontrado")
      return NextResponse.json({
        isPremium: false,
        questionsUsed: 0,
        questionsRemaining: FREE_TIER_LIMIT,
        canAsk: true,
        showWarning: false,
        limit: FREE_TIER_LIMIT,
        error: "Perfil não encontrado",
      })
    }

    const isPremium = profile.subscription_tier === "premium"
    const questionsUsed = profile.ai_questions_used || 0
    const questionsRemaining = isPremium ? -1 : Math.max(0, FREE_TIER_LIMIT - questionsUsed)

    console.log(`GET /api/ai-questions - Sucesso: premium=${isPremium}, usado=${questionsUsed}, restante=${questionsRemaining}`)

    return NextResponse.json({
      isPremium,
      questionsUsed,
      questionsRemaining,
      canAsk: isPremium || questionsUsed < FREE_TIER_LIMIT,
      showWarning: !isPremium && questionsRemaining <= 3 && questionsRemaining > 0,
      limit: FREE_TIER_LIMIT,
      authenticated: true,
    })
  } catch (error) {
    console.error("GET /api/ai-questions - Exception:", error)
    
    // Fallback seguro
    return NextResponse.json({
      isPremium: false,
      questionsUsed: 0,
      questionsRemaining: FREE_TIER_LIMIT,
      canAsk: true,
      showWarning: false,
      limit: FREE_TIER_LIMIT,
      error: "Erro interno",
    })
  }
}

export async function POST() {
  try {
    const userId = await getUserIdFromCookies()

    if (!userId) {
      console.log("POST /api/ai-questions - Usuário não autenticado")
      // Permite a pergunta para não autenticado (graceful degradation)
      return NextResponse.json({
        success: true,
        isPremium: false,
        questionsUsed: 0,
        questionsRemaining: FREE_TIER_LIMIT,
        showWarning: false,
        limit: FREE_TIER_LIMIT,
        message: "Não autenticado, pergunta permitida",
        authenticated: false,
      })
    }

    console.log(`POST /api/ai-questions - User ID: ${userId}`)

    const supabase = getSupabaseAdmin()

    // Buscar perfil
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("subscription_tier, ai_questions_used")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("POST /api/ai-questions - Erro ao buscar perfil:", error)
      
      // Permite a pergunta em caso de erro
      return NextResponse.json({
        success: true,
        isPremium: false,
        questionsUsed: 0,
        questionsRemaining: FREE_TIER_LIMIT,
        showWarning: false,
        limit: FREE_TIER_LIMIT,
        message: "Erro ao verificar limite, pergunta permitida",
      })
    }

    if (!profile) {
      console.log("POST /api/ai-questions - Perfil não encontrado")
      // Permite a pergunta
      return NextResponse.json({
        success: true,
        isPremium: false,
        questionsUsed: 0,
        questionsRemaining: FREE_TIER_LIMIT,
        showWarning: false,
        limit: FREE_TIER_LIMIT,
        message: "Perfil não encontrado, pergunta permitida",
      })
    }

    const isPremium = profile.subscription_tier === "premium"
    const questionsUsed = profile.ai_questions_used || 0

    console.log(`POST /api/ai-questions - Estado atual: premium=${isPremium}, usado=${questionsUsed}`)

    // Premium = ilimitado
    if (isPremium) {
      console.log("POST /api/ai-questions - Usuário premium, ilimitado")
      return NextResponse.json({
        success: true,
        isPremium: true,
        questionsRemaining: -1,
        message: "Premium - perguntas ilimitadas",
      })
    }

    // Verificar limite
    if (questionsUsed >= FREE_TIER_LIMIT) {
      console.log(`POST /api/ai-questions - Limite atingido: ${questionsUsed}/${FREE_TIER_LIMIT}`)
      return NextResponse.json(
        {
          error: "Limite de perguntas atingido",
          questionsUsed,
          limit: FREE_TIER_LIMIT,
          needsUpgrade: true,
        },
        { status: 403 }
      )
    }

    // Incrementar contador
    const newCount = questionsUsed + 1
    console.log(`POST /api/ai-questions - Incrementando: ${questionsUsed} -> ${newCount}`)

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ ai_questions_used: newCount })
      .eq("id", userId)

    if (updateError) {
      console.error("POST /api/ai-questions - Erro ao atualizar:", updateError)
      
      // Permite a pergunta mesmo com erro no update
      return NextResponse.json({
        success: true,
        isPremium: false,
        questionsUsed: questionsUsed,
        questionsRemaining: FREE_TIER_LIMIT - questionsUsed,
        showWarning: false,
        limit: FREE_TIER_LIMIT,
        message: "Erro ao atualizar contador, pergunta permitida",
      })
    }

    const newQuestionsRemaining = FREE_TIER_LIMIT - newCount

    console.log(`POST /api/ai-questions - Sucesso: contador=${newCount}, restante=${newQuestionsRemaining}`)

    return NextResponse.json({
      success: true,
      isPremium: false,
      questionsUsed: newCount,
      questionsRemaining: newQuestionsRemaining,
      showWarning: newQuestionsRemaining <= 3 && newQuestionsRemaining > 0,
      limit: FREE_TIER_LIMIT,
    })
  } catch (error) {
    console.error("POST /api/ai-questions - Exception:", error)
    
    // Fallback: permite a pergunta
    return NextResponse.json({
      success: true,
      isPremium: false,
      questionsUsed: 0,
      questionsRemaining: FREE_TIER_LIMIT,
      showWarning: false,
      limit: FREE_TIER_LIMIT,
      message: "Erro interno, pergunta permitida",
    })
  }
}
