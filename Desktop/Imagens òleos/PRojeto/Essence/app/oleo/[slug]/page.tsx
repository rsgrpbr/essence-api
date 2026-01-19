import Link from "next/link"
import { findOleo, fetchOleos } from "@/lib/data/oleos"
import { ArrowLeft, AlertTriangle, Lock } from "lucide-react"
import type { Metadata } from "next"
import {
  OleoImageClient,
  RelatedOleoCardClient,
  LockedContentClient,
  UsageTipsClient,
  PsicoaromaterapiaClient,
} from "./client-components"
import { KITS } from "@/lib/data/oleos"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const oleo = await findOleo(slug)

  if (!oleo) {
    return {
      title: "Óleo não encontrado — Guia do Aroma",
    }
  }

  return {
    title: `${oleo.nome} — Guia do Aroma`,
    description: oleo.nota,
  }
}

export default async function OleoDetailPage({ params }: Props) {
  const { slug } = await params
  const oleo = await findOleo(slug)

  if (!oleo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-50 via-amber-50/50 to-emerald-50/30 px-4">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-emerald-900">Óleo não encontrado</h1>
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-900">
            <ArrowLeft className="h-4 w-4" />
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    )
  }

  const allOleos = await fetchOleos()
  const relatedOleos = allOleos
    .filter((o) => o.slug !== oleo.slug && o.categorias.some((cat) => oleo.categorias.includes(cat)))
    .slice(0, 6)

  const kitValues = Object.values(KITS)
  const displayCategories = oleo.categorias.filter((cat) => !kitValues.includes(cat as any))

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/50 to-emerald-50/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-700 transition-colors hover:text-emerald-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>

        <LockedContentClient oleo={oleo}>
          <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="grid gap-0 lg:grid-cols-[420px,1fr]">
              {/* Left: Botanical illustration */}
              <div className="relative bg-gradient-to-br from-emerald-100 to-teal-100 p-8">
                <OleoImageClient slug={oleo.slug} nome={oleo.nome} />
              </div>

              {/* Right: All content */}
              <div className="p-8 lg:p-10">
                {/* Header section */}
                <div className="mb-8">
                  <div className="flex items-start justify-between mb-4">
                    <h1 className="font-serif text-3xl font-bold text-gray-900">{oleo.nome}</h1>
                    {!oleo.is_free && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                        <Lock className="w-3 h-3" />
                        Premium
                      </span>
                    )}
                  </div>

                  {displayCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {displayCategories.map((cat) => (
                        <span
                          key={cat}
                          className="rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-semibold text-gray-700">Origem:</span>{" "}
                      <span className="text-teal-700">{oleo.origem}</span>
                    </p>
                    {oleo.composicao.length > 0 && (
                      <p>
                        <span className="font-semibold text-gray-700">Composição:</span>{" "}
                        <span className="text-gray-600">{oleo.composicao.join(", ")}</span>
                      </p>
                    )}
                    <p>
                      <span className="font-semibold text-gray-700">Aroma:</span>{" "}
                      <span className="text-gray-600">{oleo.aroma}</span>
                    </p>
                  </div>
                </div>

                {/* Dicas de uso */}
                <UsageTipsClient dicasUso={oleo.dicasUso} />

                {/* Psicoaromaterapia */}
                {oleo.psico && <PsicoaromaterapiaClient psico={oleo.psico} nomeOleo={oleo.nome} />}

                {/* Precauções */}
                {oleo.precaucoes && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <h3 className="text-lg font-bold text-red-900">Precauções</h3>
                    </div>
                    <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-5">
                      <p className="text-sm leading-relaxed text-gray-700">{oleo.precaucoes}</p>
                    </div>
                  </div>
                )}

                {/* Footer disclaimer */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    As informações apresentadas têm caráter educativo e não substituem a avaliação de um profissional de
                    saúde qualificado. Consulte sempre um aromaterapeuta ou profissional de saúde.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </LockedContentClient>

        {/* Related oils */}
        {relatedOleos.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-bold text-emerald-900">Óleos Relacionados</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {relatedOleos.map((related) => (
                <RelatedOleoCardClient key={related.slug} oleo={related} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
