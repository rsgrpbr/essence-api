import { readFileSync, writeFileSync } from "fs"
import { join } from "path"

interface OleoRow {
  nome: string
  slug: string
  nota: string
  kits: string
  usos: string
  precaucoes: string
  tags: string
}

function parseCSV(content: string): OleoRow[] {
  const lines = content.split("\n").filter((line) => line.trim())
  const headers = lines[0].split(",")

  return lines.slice(1).map((line) => {
    const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || []
    const cleanValues = values.map((v) => v.replace(/^"|"$/g, "").trim())

    return {
      nome: cleanValues[0] || "",
      slug: cleanValues[1] || "",
      nota: cleanValues[2] || "",
      kits: cleanValues[3] || "",
      usos: cleanValues[4] || "",
      precaucoes: cleanValues[5] || "",
      tags: cleanValues[6] || "",
    }
  })
}

function generateTypeScript(oleos: OleoRow[]): string {
  const oleosCode = oleos
    .map((oleo) => {
      const kitsArray = oleo.kits
        .split(",")
        .map((k) => `"${k.trim()}"`)
        .join(", ")
      const usosArray = oleo.usos
        .split(";")
        .map((u) => `"${u.trim()}"`)
        .join(",\n    ")
      const precaucoesArray = oleo.precaucoes
        .split(";")
        .map((p) => `"${p.trim()}"`)
        .join(",\n    ")
      const tagsArray = oleo.tags
        .split(",")
        .map((t) => `"${t.trim()}"`)
        .join(", ")

      return `  {
    nome: "${oleo.nome}",
    slug: "${oleo.slug}",
    nota: "${oleo.nota}" as const,
    kits: [${kitsArray}],
    usos: [
    ${usosArray}
    ],
    precaucoes: [
    ${precaucoesArray}
    ],
    tags: [${tagsArray}]
  }`
    })
    .join(",\n")

  return `export interface Oleo {
  nome: string
  slug: string
  nota: "Top" | "Middle" | "Base"
  kits: string[]
  usos: string[]
  precaucoes: string[]
  tags: string[]
}

export const oleos: Oleo[] = [
${oleosCode}
]

export function getOleoBySlug(slug: string): Oleo | undefined {
  return oleos.find(oleo => oleo.slug === slug)
}

export function getOleosByKit(kit: string): Oleo[] {
  if (kit === "Todos") return oleos
  return oleos.filter(oleo => oleo.kits.includes(kit))
}

export const kits = [
  "Todos",
  "Living Brasil",
  "Kids",
  "Emotional",
  "AromaTouch",
  "Beauty Power",
  "Extras"
] as const
`
}

// Ler CSV
const csvPath = join(process.cwd(), "public", "template-oleos.csv")
const csvContent = readFileSync(csvPath, "utf-8")

// Converter
const oleos = parseCSV(csvContent)
const tsContent = generateTypeScript(oleos)

// Salvar
const outputPath = join(process.cwd(), "lib", "data", "oleos.ts")
writeFileSync(outputPath, tsContent, "utf-8")

console.log(`✅ Importados ${oleos.length} óleos com sucesso!`)
console.log(`📝 Arquivo gerado: ${outputPath}`)
