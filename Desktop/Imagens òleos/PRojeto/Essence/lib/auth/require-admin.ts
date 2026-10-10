import { createAdminClient } from "@/lib/supabase/admin"

// ID do usuário administrador. Pode ser trocado pela variável ADMIN_USER_ID.
export const ADMIN_USER_ID = process.env.ADMIN_USER_ID || "c6b58bfb-bcd0-45c7-a595-25574693505b"

/**
 * Confere com o Supabase se o token de acesso é válido e pertence ao admin.
 * Usar em toda rota ou server action que mexe em dados com o admin client.
 */
export async function isAdminToken(accessToken?: string | null): Promise<boolean> {
  if (!accessToken) return false
  try {
    const { data, error } = await createAdminClient().auth.getUser(accessToken)
    return !error && data.user?.id === ADMIN_USER_ID
  } catch {
    return false
  }
}

/** Lê o token do cabeçalho "Authorization: Bearer ..." */
export function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") || ""
  return header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : null
}
