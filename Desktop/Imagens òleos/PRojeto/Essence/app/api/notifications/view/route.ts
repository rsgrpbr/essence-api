import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    console.log("[API] 📊 POST /api/notifications/view chamado")

    const body = await request.json()
    const { modalId, userId } = body

    console.log("[API] 📊 Params:", { modalId, userId })

    if (!modalId || !userId) {
      console.log("[API] ❌ Parâmetros faltando")
      return NextResponse.json({ error: "modalId e userId são obrigatórios" }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Verificar se já visualizou
    const { data: existing } = await supabase
      .from("user_modal_views")
      .select("id")
      .eq("user_id", userId)
      .eq("modal_id", modalId)
      .single()

    console.log("[API] 📊 Existing view:", existing)

    if (existing) {
      console.log("[API] ✅ Usuário já visualizou este modal")
      return NextResponse.json({ success: true, alreadyViewed: true })
    }

    // Inserir nova visualização
    const { error: insertError } = await supabase.from("user_modal_views").insert({
      user_id: userId,
      modal_id: modalId,
    })

    if (insertError) {
      console.error("[API] ❌ Erro ao inserir view:", insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    console.log("[API] ✅ View registrada com sucesso!")
    return NextResponse.json({ success: true, alreadyViewed: false })
  } catch (error) {
    console.error("[API] ❌ Erro geral:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
