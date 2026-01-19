import { supabase } from "../supabase"

// ====================================
// TYPES
// ====================================

export type UsoSugerido = {
  tipo: string // "A" = Aromático, "T" = Tópico
  titulo: string
  descricao: string
}

export type Oleo = {
  slug: string
  nome: string
  categorias: string[]
  nota: string
  tags: string[]
  dicasUso: { categoria: string; dicas: string[] }[]
  imagem: string
  cor: string
  formasUso: string[]
  origem: string
  aroma: string
  composicao: string[]
  precaucoes?: string
  is_free: boolean
  // Psicoaromaterapia estruturada (NOVO)
  psico: {
    textoPrincipal: string
    emocoesNegativas: string[]
    propriedadesPositivas: string[]
    usosSugeridos: UsoSugerido[]
  }
}

// ====================================
// FUNÇÕES
// ====================================

export async function fetchOleos(): Promise<Oleo[]> {
  const { data, error } = await supabase
    .from("essential_oils")
    .select("*")
    .eq("is_active", true)
    .order("is_free", { ascending: false })
    .order("display_order")

  if (error) {
    console.error("Erro ao buscar óleos:", error)
    return []
  }

  return (data || []).map((oleo) => ({
    slug: oleo.slug || "",
    nome: oleo.nome || "",
    categorias: Array.isArray(oleo.categorias) ? oleo.categorias : [],
    nota: oleo.nota || "",
    tags: Array.isArray(oleo.tags) ? oleo.tags : [],
    // CORRETO: dicasuso (minúsculo)
    dicasUso: Array.isArray(oleo.dicasuso) ? oleo.dicasuso : [],
    imagem: oleo.imagem || "",
    cor: oleo.cor || "#000000",
    // CORRETO: formasuso (minúsculo)
    formasUso: Array.isArray(oleo.formasuso) ? oleo.formasuso.map((f: any) => f?.code || f).filter(Boolean) : [],
    origem: oleo.origem || "",
    aroma: oleo.aroma || "",
    composicao: Array.isArray(oleo.composicao) ? oleo.composicao : [],
    precaucoes: oleo.precaucoes || undefined,
    is_free: oleo.is_free === true,
    psico: {
      textoPrincipal: oleo.psico_texto_principal || "",
      emocoesNegativas: Array.isArray(oleo.psico_emocoes_negativas) ? oleo.psico_emocoes_negativas : [],
      propriedadesPositivas: Array.isArray(oleo.psico_propriedades_positivas) ? oleo.psico_propriedades_positivas : [],
      usosSugeridos: Array.isArray(oleo.psico_usos_sugeridos) ? oleo.psico_usos_sugeridos : [],
    },
  }))
}

export async function findOleo(slug: string): Promise<Oleo | null> {
  const { data, error } = await supabase
    .from("essential_oils")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error || !data) {
    console.error("Erro ao buscar óleo:", error)
    return null
  }

  return {
    slug: data.slug || "",
    nome: data.nome || "",
    categorias: Array.isArray(data.categorias) ? data.categorias : [],
    nota: data.nota || "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    // CORRETO: dicasuso (minúsculo)
    dicasUso: Array.isArray(data.dicasuso) ? data.dicasuso : [],
    imagem: data.imagem || "",
    cor: data.cor || "#000000",
    // CORRETO: formasuso (minúsculo)
    formasUso: Array.isArray(data.formasuso) ? data.formasuso.map((f: any) => f?.code || f).filter(Boolean) : [],
    origem: data.origem || "",
    aroma: data.aroma || "",
    composicao: Array.isArray(data.composicao) ? data.composicao : [],
    precaucoes: data.precaucoes || undefined,
    is_free: data.is_free === true,
    psico: {
      textoPrincipal: data.psico_texto_principal || "",
      emocoesNegativas: Array.isArray(data.psico_emocoes_negativas) ? data.psico_emocoes_negativas : [],
      propriedadesPositivas: Array.isArray(data.psico_propriedades_positivas) ? data.psico_propriedades_positivas : [],
      usosSugeridos: Array.isArray(data.psico_usos_sugeridos) ? data.psico_usos_sugeridos : [],
    },
  }
}

export const KITS = {
  LIVING: "Living Brasil",
  KIDS: "Kids",
  EMOTIONAL: "Emotional",
  AROMATOUCH: "AromaTouch",
  BEAUTY_POWER: "Beauty Power",
  EXTRAS: "Extras",
} as const

export const FORMAS_USO = {
  AROMATICO: { code: "A", label: "Aromático", color: "#4A90E2" },
  TOPICO: { code: "T", label: "Tópico", color: "#F5A623" },
  NEAT: { code: "N", label: "Puro (Sem diluir)", color: "#50E3C2" },
  SENSIVEL: { code: "S", label: "Sensível", color: "#9013FE" },
  INTERNO: { code: "I", label: "Interno", color: "#7ED321" },
} as const

export const oleos: Oleo[] = []

export function listByKit(kit: string): Oleo[] {
  return []
}
