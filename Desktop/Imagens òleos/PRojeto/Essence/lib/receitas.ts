import { supabase } from "./supabase"

/**
 * Tipo que representa uma receita de óleos essenciais
 */
export type Receita = {
  id: string
  slug: string
  nome: string

  // Categorização
  categoria: "difusor" | "roll-on" | "massagem" | "banho" | "spray"
  subcategoria?: string
  tags: string[]

  // Descrição e benefícios
  descricao: string
  beneficios: string[]

  // Ingredientes
  ingredientes: {
    tipo: "oleo_essencial" | "carreador" | "outro"
    nome: string
    quantidade: string
    oleo_id?: string // ID do óleo na tabela essential_oils (se for óleo essencial)
  }[]

  // Instruções
  modoPreparo: {
    passo: number
    texto: string
  }[]
  comoUsar: string

  // Avisos
  precaucoes: string[]
  contraindicacoes: string[]

  // Metadados visuais
  imagem?: string
  cor: string
  icone: string

  // Controle de acesso
  isFree: boolean
  isActive: boolean
  displayOrder: number

  // Info adicional
  tempoPreparo?: number // em minutos
  rendimento?: string
  dificuldade?: "facil" | "medio" | "avancado"

  // Timestamps
  createdAt: string
  updatedAt: string
}

/**
 * Tipo para criar/atualizar receita (campos opcionais)
 */
export type ReceitaInput = Omit<Receita, "id" | "createdAt" | "updatedAt">

/**
 * Converte dados do Supabase para formato do app
 */
function mapReceitaFromDB(data: any): Receita {
  return {
    id: data.id,
    slug: data.slug,
    nome: data.nome,
    categoria: data.categoria,
    subcategoria: data.subcategoria,
    tags: data.tags || [],
    descricao: data.descricao,
    beneficios: data.beneficios || [],
    ingredientes: data.ingredientes || [],
    modoPreparo: data.modo_preparo || [],
    comoUsar: data.como_usar,
    precaucoes: data.precaucoes || [],
    contraindicacoes: data.contraindicacoes || [],
    imagem: data.imagem,
    cor: data.cor,
    icone: data.icone,
    isFree: data.is_free,
    isActive: data.is_active,
    displayOrder: data.display_order,
    tempoPreparo: data.tempo_preparo,
    rendimento: data.rendimento,
    dificuldade: data.dificuldade,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

/**
 * Buscar todas as receitas ativas (todas são gratuitas)
 */
export async function getReceitas(): Promise<Receita[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Erro ao buscar receitas:", error)
    return []
  }

  return data.map(mapReceitaFromDB)
}

/**
 * Buscar receitas por categoria
 */
export async function getReceitasPorCategoria(categoria: Receita["categoria"]): Promise<Receita[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("is_active", true)
    .eq("categoria", categoria)
    .order("display_order", { ascending: true })

  if (error) {
    console.error(`Erro ao buscar receitas da categoria ${categoria}:`, error)
    return []
  }

  return data.map(mapReceitaFromDB)
}

/**
 * Buscar receita por slug
 */
export async function getReceitaBySlug(slug: string): Promise<Receita | null> {
  const { data, error } = await supabase.from("recipes").select("*").eq("slug", slug).eq("is_active", true).single()

  if (error) {
    console.error(`Erro ao buscar receita ${slug}:`, error)
    return null
  }

  return mapReceitaFromDB(data)
}

/**
 * Buscar receitas por tags
 */
export async function getReceitasPorTag(tag: string): Promise<Receita[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("is_active", true)
    .contains("tags", [tag])
    .order("display_order", { ascending: true })

  if (error) {
    console.error(`Erro ao buscar receitas com tag ${tag}:`, error)
    return []
  }

  return data.map(mapReceitaFromDB)
}

/**
 * Buscar receitas que contenham um óleo específico
 */
export async function getReceitasComOleo(oleoNome: string): Promise<Receita[]> {
  const { data, error } = await supabase.from("recipes").select("*").eq("is_active", true)

  if (error) {
    console.error("Erro ao buscar receitas:", error)
    return []
  }

  // Filtrar receitas que contenham o óleo nos ingredientes
  const receitasFiltradas = data.filter((receita: any) => {
    const ingredientes = receita.ingredientes || []
    return ingredientes.some(
      (ing: any) => ing.tipo === "oleo_essencial" && ing.nome.toLowerCase().includes(oleoNome.toLowerCase()),
    )
  })

  return receitasFiltradas.map(mapReceitaFromDB)
}

/**
 * Buscar receitas por dificuldade
 */
export async function getReceitasPorDificuldade(dificuldade: "facil" | "medio" | "avancado"): Promise<Receita[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("is_active", true)
    .eq("dificuldade", dificuldade)
    .order("display_order", { ascending: true })

  if (error) {
    console.error(`Erro ao buscar receitas ${dificuldade}:`, error)
    return []
  }

  return data.map(mapReceitaFromDB)
}

/**
 * Buscar receitas rápidas (tempo de preparo <= X minutos)
 */
export async function getReceitasRapidas(tempoMaximo = 10): Promise<Receita[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("is_active", true)
    .lte("tempo_preparo", tempoMaximo)
    .order("tempo_preparo", { ascending: true })

  if (error) {
    console.error("Erro ao buscar receitas rápidas:", error)
    return []
  }

  return data.map(mapReceitaFromDB)
}

/**
 * Contar receitas por categoria
 */
export async function contarReceitasPorCategoria(): Promise<Record<Receita["categoria"], number>> {
  const { data, error } = await supabase.from("recipes").select("categoria").eq("is_active", true)

  if (error) {
    console.error("Erro ao contar receitas:", error)
    return {
      difusor: 0,
      "roll-on": 0,
      massagem: 0,
      banho: 0,
      spray: 0,
    }
  }

  const contagem = data.reduce(
    (acc, item) => {
      acc[item.categoria] = (acc[item.categoria] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return contagem as Record<Receita["categoria"], number>
}

/**
 * Buscar categorias únicas
 */
export async function getCategorias(): Promise<Receita["categoria"][]> {
  const { data, error } = await supabase.from("recipes").select("categoria").eq("is_active", true)

  if (error) {
    console.error("Erro ao buscar categorias:", error)
    return []
  }

  const categorias = [...new Set(data.map((item) => item.categoria))]
  return categorias as Receita["categoria"][]
}

/**
 * Buscar todas as tags únicas
 */
export async function getAllTags(): Promise<string[]> {
  const { data, error } = await supabase.from("recipes").select("tags").eq("is_active", true)

  if (error) {
    console.error("Erro ao buscar tags:", error)
    return []
  }

  const todasTags = data.flatMap((item) => item.tags || [])
  return [...new Set(todasTags)].sort()
}

/**
 * Buscar receitas similares (mesma categoria ou tags em comum)
 */
export async function getReceitasSimilares(receita: Receita, limite = 3): Promise<Receita[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("is_active", true)
    .neq("id", receita.id) // Excluir a própria receita
    .or(`categoria.eq.${receita.categoria},tags.cs.{${receita.tags.join(",")}}`)
    .limit(limite)

  if (error) {
    console.error("Erro ao buscar receitas similares:", error)
    return []
  }

  return data.map(mapReceitaFromDB)
}

/**
 * Buscar receitas criadas recentemente
 */
export async function getReceitasRecentes(limite = 5): Promise<Receita[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limite)

  if (error) {
    console.error("Erro ao buscar receitas recentes:", error)
    return []
  }

  return data.map(mapReceitaFromDB)
}

/**
 * Buscar receita por ID
 */
export async function getReceitaById(id: string): Promise<Receita | null> {
  const { data, error } = await supabase.from("recipes").select("*").eq("id", id).eq("is_active", true).single()

  if (error) {
    console.error(`Erro ao buscar receita ${id}:`, error)
    return null
  }

  return mapReceitaFromDB(data)
}
