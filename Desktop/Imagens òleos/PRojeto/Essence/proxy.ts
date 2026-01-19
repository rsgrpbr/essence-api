import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ADMIN_ID = "c6b58bfb-bcd0-45c7-a595-25574693505b"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/admin")) {
    console.log("🔒 [MIDDLEWARE] Verificando acesso admin para:", pathname)

    try {
      // Buscar cookies essence-auth (podem estar divididos em .0 e .1)
      const authCookie0 = request.cookies.get("essence-auth.0")
      const authCookie1 = request.cookies.get("essence-auth.1")

      if (!authCookie0 || !authCookie0.value) {
        console.warn("⚠️ [MIDDLEWARE] Cookie essence-auth.0 não encontrado")
        return NextResponse.redirect(new URL("/", request.url))
      }

      // Remover prefixo 'base64-' se existir
      let cookieValue = authCookie0.value
      if (cookieValue.startsWith("base64-")) {
        cookieValue = cookieValue.substring(7) // Remove 'base64-'
      }

      // Adicionar segundo cookie se existir
      if (authCookie1?.value) {
        cookieValue += authCookie1.value
      }

      console.log("🍪 [MIDDLEWARE] Cookie length:", cookieValue.length)

      // Decodificar base64 usando atob() (Edge Runtime compatible)
      let decodedString: string
      try {
        decodedString = atob(cookieValue)
        console.log("✅ [MIDDLEWARE] Base64 decodificado com sucesso")
      } catch (decodeError) {
        console.error("❌ [MIDDLEWARE] Erro ao decodificar base64:", decodeError)
        return NextResponse.redirect(new URL("/", request.url))
      }

      // Parsear JSON
      let sessionData: any
      try {
        sessionData = JSON.parse(decodedString)
        console.log("✅ [MIDDLEWARE] JSON parseado com sucesso")
      } catch (parseError) {
        console.error("❌ [MIDDLEWARE] Erro ao parsear JSON:", parseError)
        return NextResponse.redirect(new URL("/", request.url))
      }

      // Extrair user.id
      const userId = sessionData?.user?.id
      const userEmail = sessionData?.user?.email

      console.log("👤 [MIDDLEWARE] User ID:", userId)
      console.log("📧 [MIDDLEWARE] Email:", userEmail)

      // Verificar se é admin
      if (userId === ADMIN_ID) {
        console.log("✅ [MIDDLEWARE] Admin verificado - acesso autorizado")
        return NextResponse.next()
      }

      console.warn("⚠️ [MIDDLEWARE] Não é admin - ID esperado:", ADMIN_ID)
      console.warn("⚠️ [MIDDLEWARE] ID recebido:", userId)
      return NextResponse.redirect(new URL("/", request.url))
    } catch (error) {
      console.error("❌ [MIDDLEWARE] Erro inesperado:", error)
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/admin/:path*",
}
