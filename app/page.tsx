import HomePageClient from './HomePageClient'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getPublicCoordinates } from '@/lib/location'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let listings: any[] = []

  try {
    const supabase = await createSupabaseServerClient()
    const { data } = await supabase
      .from('listings')
      .select('*, listing_images(*)')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(60)

    if (data) {
      listings = data.map((listing: any) => {
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
    }
  } catch (err) {
    console.error('Error fetching home listings:', err)
  }

  return <HomePageClient initialListings={listings} />
}
