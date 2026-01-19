export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-50 via-amber-50/50 to-emerald-50/30">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
        <p className="mt-4 text-emerald-700">Carregando...</p>
      </div>
    </div>
  )
}
