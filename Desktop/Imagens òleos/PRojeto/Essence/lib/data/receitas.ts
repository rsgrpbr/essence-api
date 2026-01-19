export type Receita = {
  id: string
  nome: string
  categoria: "difusor" | "roll-on" | "spray" | "massagem" | "banho"
  finalidade: string
  ingredientes: { nome: string; quantidade: string }[]
  modoPreparo: string[]
  comoUsar: string
  imagem?: string
}

export const CATEGORIAS_RECEITAS = {
  DIFUSOR: { id: "difusor", label: "Para Difusor", icon: "💨" },
  ROLLON: { id: "roll-on", label: "Roll-on", icon: "🌀" },
  SPRAY: { id: "spray", label: "Spray Ambiente", icon: "💦" },
  MASSAGEM: { id: "massagem", label: "Óleo de Massagem", icon: "💆" },
  BANHO: { id: "banho", label: "Banho Aromático", icon: "🛁" },
} as const

export const receitas: Receita[] = [
  {
    id: "blend-sono-profundo",
    nome: "Blend Sono Profundo",
    categoria: "difusor",
    finalidade: "Promove relaxamento profundo e sono reparador",
    ingredientes: [
      { nome: "Lavanda", quantidade: "4 gotas" },
      { nome: "Cedro", quantidade: "3 gotas" },
      { nome: "Camomila Romana", quantidade: "2 gotas" },
    ],
    modoPreparo: [
      "Adicione as gotas de cada óleo no difusor ultrassônico",
      "Complete com água até a linha indicada",
      "Ligue o difusor 30 minutos antes de dormir",
    ],
    comoUsar:
      "Difundir no quarto 30 minutos antes de dormir para criar um ambiente propício ao sono profundo e reparador.",
  },
  {
    id: "roll-on-anti-estresse",
    nome: "Roll-on Anti-Estresse",
    categoria: "roll-on",
    finalidade: "Reduz ansiedade e promove calma instantânea",
    ingredientes: [
      { nome: "Lavanda", quantidade: "5 gotas" },
      { nome: "Bergamota", quantidade: "3 gotas" },
      { nome: "Frankincense", quantidade: "2 gotas" },
      { nome: "Óleo de jojoba", quantidade: "10ml" },
    ],
    modoPreparo: [
      "Em um frasco roll-on de 10ml, adicione os óleos essenciais",
      "Complete com óleo de jojoba até o topo",
      "Feche bem e agite suavemente para misturar",
      "Deixe descansar por 24 horas antes do primeiro uso",
    ],
    comoUsar:
      "Aplicar nos pulsos, têmporas e nuca sempre que sentir ansiedade ou estresse. Inale profundamente após aplicar.",
  },
  {
    id: "spray-energia-matinal",
    nome: "Spray Energia Matinal",
    categoria: "spray",
    finalidade: "Desperta e energiza para começar o dia com disposição",
    ingredientes: [
      { nome: "Hortelã-Pimenta", quantidade: "10 gotas" },
      { nome: "Limão", quantidade: "8 gotas" },
      { nome: "Alecrim", quantidade: "5 gotas" },
      { nome: "Água destilada", quantidade: "100ml" },
      { nome: "Álcool de cereais", quantidade: "1 colher de chá" },
    ],
    modoPreparo: [
      "Em um frasco spray de 100ml, adicione o álcool de cereais",
      "Adicione todos os óleos essenciais e agite bem",
      "Complete com água destilada",
      "Agite vigorosamente antes de cada uso",
    ],
    comoUsar:
      "Borrifar no ambiente pela manhã, especialmente em quartos e escritórios. Evite contato direto com os olhos.",
  },
  {
    id: "banho-relaxante",
    nome: "Banho Relaxante",
    categoria: "banho",
    finalidade: "Relaxamento profundo e alívio de tensões musculares",
    ingredientes: [
      { nome: "Lavanda", quantidade: "6 gotas" },
      { nome: "Ylang Ylang", quantidade: "4 gotas" },
      { nome: "Sal marinho", quantidade: "2 colheres de sopa" },
    ],
    modoPreparo: [
      "Em uma tigela pequena, misture o sal marinho",
      "Adicione as gotas de óleo essencial ao sal",
      "Misture bem até os óleos serem absorvidos pelo sal",
    ],
    comoUsar: "Dissolva a mistura na banheira com água morna. Relaxe por 20-30 minutos para máximo benefício.",
  },
  {
    id: "oleo-massagem-calmante",
    nome: "Óleo de Massagem Calmante",
    categoria: "massagem",
    finalidade: "Alivia tensões musculares e promove relaxamento",
    ingredientes: [
      { nome: "Camomila", quantidade: "8 gotas" },
      { nome: "Lavanda", quantidade: "6 gotas" },
      { nome: "Óleo de amêndoas", quantidade: "30ml" },
    ],
    modoPreparo: [
      "Em um frasco de vidro âmbar de 30ml, adicione o óleo de amêndoas",
      "Adicione as gotas de óleos essenciais",
      "Feche bem e agite suavemente",
      "Deixe descansar por 24 horas antes do uso",
    ],
    comoUsar: "Massagear pescoço, ombros e costas com movimentos circulares suaves. Ideal para uso noturno.",
  },
  {
    id: "blend-foco-concentracao",
    nome: "Blend Foco e Concentração",
    categoria: "difusor",
    finalidade: "Aumenta foco mental e produtividade",
    ingredientes: [
      { nome: "Alecrim", quantidade: "4 gotas" },
      { nome: "Hortelã-Pimenta", quantidade: "3 gotas" },
      { nome: "Limão", quantidade: "2 gotas" },
    ],
    modoPreparo: [
      "Adicione as gotas no difusor",
      "Complete com água",
      "Difunda durante períodos de estudo ou trabalho",
    ],
    comoUsar:
      "Difundir no ambiente de trabalho ou estudo para manter foco e clareza mental durante tarefas que exigem concentração.",
  },
  {
    id: "roll-on-dor-cabeca",
    nome: "Roll-on Alívio de Tensão",
    categoria: "roll-on",
    finalidade: "Alivia tensões e desconfortos ocasionais na cabeça",
    ingredientes: [
      { nome: "Hortelã-Pimenta", quantidade: "4 gotas" },
      { nome: "Lavanda", quantidade: "4 gotas" },
      { nome: "Frankincense", quantidade: "2 gotas" },
      { nome: "Óleo de coco fracionado", quantidade: "10ml" },
    ],
    modoPreparo: [
      "Adicione os óleos essenciais no frasco roll-on",
      "Complete com óleo de coco fracionado",
      "Agite bem e deixe descansar por 24 horas",
    ],
    comoUsar: "Aplicar nas têmporas, testa e nuca com movimentos circulares suaves. Evite contato com os olhos.",
  },
  {
    id: "spray-purificacao-ambiente",
    nome: "Spray Purificação de Ambientes",
    categoria: "spray",
    finalidade: "Purifica e limpa energeticamente os ambientes",
    ingredientes: [
      { nome: "Melaleuca (Tea Tree)", quantidade: "10 gotas" },
      { nome: "Limão", quantidade: "8 gotas" },
      { nome: "Eucalipto", quantidade: "5 gotas" },
      { nome: "Água destilada", quantidade: "100ml" },
      { nome: "Vinagre branco", quantidade: "1 colher de sopa" },
    ],
    modoPreparo: [
      "Adicione o vinagre branco no frasco spray",
      "Adicione todos os óleos essenciais",
      "Complete com água destilada e agite bem",
    ],
    comoUsar: "Borrifar em ambientes, superfícies e tecidos para purificação natural. Agite antes de cada uso.",
  },
]

export function getReceitasByCategoria(categoria: string): Receita[] {
  return receitas.filter((r) => r.categoria === categoria)
}

export function findReceita(id: string): Receita | undefined {
  return receitas.find((r) => r.id === id)
}
