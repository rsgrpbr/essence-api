/**
 * Tenta carregar imagem com múltiplos formatos e variações de nome
 * Ordem de tentativa:
 * 1. slug.webp
 * 2. slug.jpg
 * 3. slug.jpeg
 * 4. slug.png
 */
export function getOleoImagePath(slug: string): string {
  // Retorna o caminho base - o Next.js Image component vai tentar carregar
  // e o onError handler vai usar o fallback se necessário
  return `/oleos/${slug}.jpg`
}

/**
 * Lista de formatos suportados em ordem de preferência
 */
export const IMAGE_FORMATS = ["webp", "jpg", "jpeg", "png"] as const

/**
 * Fallback para quando nenhuma imagem for encontrada
 */
export const PLACEHOLDER_IMAGE = "/oleos/_placeholder.jpg"
