import ListingsPage from '@/app/listings/page'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ ciudad?: string; universidad?: string; precio_maximo?: string }>
}) {
  const params = await searchParams

  // Validar precio_maximo: solo número positivo; si no viene o es inválido, no se aplica filtro
  const rawPrice = params.precio_maximo ? parseInt(params.precio_maximo, 10) : NaN
  const initialMaxPrice = Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : undefined

  return (
    <ListingsPage
      initialCity={params.ciudad ?? 'Arequipa'}
      initialUniversity={params.universidad ?? ''}
      initialMaxPrice={initialMaxPrice}
    />
  )
}
