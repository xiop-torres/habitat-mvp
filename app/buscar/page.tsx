import ListingsPage from '@/app/listings/page'

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ ciudad?: string; universidad?: string }> }) {
	const params = await searchParams
	return <ListingsPage initialCity={params.ciudad ?? 'Arequipa'} initialUniversity={params.universidad ?? ''} />
}
