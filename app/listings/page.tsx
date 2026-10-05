import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getPublicCoordinates } from '@/lib/location'
import ListingsClient from './ListingsClient'
import { TriangleAlert } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ListingsPage({
  initialCity = 'Arequipa',
  initialUniversity = '',
}: {
  initialCity?: string
  initialUniversity?: string
}) {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('listings')
    .select('*, listing_images(*)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="flex max-w-sm flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
          <TriangleAlert className="text-red-500" size={32} />
          <p className="text-sm font-black text-red-700">No se pudieron cargar los alojamientos. Intenta de nuevo.</p>
        </div>
      </div>
    )
  }

  const listings = data ?? []

  // Sanitizar coordenadas ANTES de enviarlas al cliente
  const sanitizedListings = listings.map((listing: any) => {
    let publicLat = null
    let publicLng = null

    if (listing.lat !== null && listing.lng !== null) {
      const coords = getPublicCoordinates(listing.lat, listing.lng)
      if (coords) {
        publicLat = coords.publicLat
        publicLng = coords.publicLng
      }
    }

    return {
      ...listing,
      lat: publicLat,
      lng: publicLng,
    }
  })

  return (
    <ListingsClient
      initialCity={initialCity}
      initialUniversity={initialUniversity}
      initialListings={sanitizedListings}
    />
  )
}
