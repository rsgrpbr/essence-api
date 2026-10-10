import { NextResponse } from "next/server"

// Repassa a pergunta para a essence-api pelo servidor, para que a chave
// ESSENCE_API_SECRET nunca vá para o navegador. Antes ela era lida como
// NEXT_PUBLIC_ESSENCE_API_SECRET, o que a deixava visível no código do site.
const ESSENCE_API_URL = process.env.ESSENCE_API_URL || "https://essence-api-xrz6.vercel.app/api/ai-sugestoes"

export async function POST(request: Request) {
  const secret = process.env.ESSENCE_API_SECRET
  if (!secret) {
    console.error("[ai-sugestoes] ESSENCE_API_SECRET não configurado")
    return NextResponse.json({ error: "Configuração do servidor inválida" }, { status: 500 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Corpo inválido" }, { status: 400 })
  }

  try {
    const upstream = await fetch(ESSENCE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": secret,
        "X-Forwarded-For": request.headers.get("x-forwarded-for") ?? "",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    const data = await upstream.json().catch(() => ({ error: "Resposta inválida da API" }))
    return NextResponse.json(data, { status: upstream.status })
  } catch (error) {
    console.error("[ai-sugestoes] Falha ao chamar a essence-api:", error)
    return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 })
  }
}
