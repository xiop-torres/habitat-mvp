'use client'

import { useState, useEffect } from 'react'
import { Heart, Loader2, TriangleAlert } from 'lucide-react'
import { AppHeader, EmptyState, Footer } from '@/components/Shared'
import { RoomCard, type RoomCardData } from '@/components/RoomCard'
import { FavoriteButton } from '@/components/FavoriteButton'
import { getStudentFavorites, type Favorite } from '@/lib/supabase/favorites'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { getListingImageUrl } from '@/lib/supabase/storage'
import { useRouter } from 'next/navigation'

export default function FavoritesPage() {
  const router = useRouter()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function loadFavorites() {
      try {
        const supabase = createSupabaseBrowserClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          router.push('/login')
          return
        }

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle()
        
        if (mounted && profile) {
          setRole(profile.role)
          
          if (profile.role === 'student' || profile.role === 'admin') {
            const data = await getStudentFavorites()
            if (mounted) setFavorites(data)
          }
        }
      } catch (err) {
        console.error('Error loading favorites:', err)
        if (mounted) setError(true)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadFavorites()
    return () => { mounted = false }
  }, [router])

  // Remove the favorite from the local state list so it disappears immediately
  function handleFavoriteRemoved(listingId: string, isFavorite: boolean) {
    if (!isFavorite) {
      setFavorites(current => current.filter(fav => fav.listing.id !== listingId))
    }
  }

  // Comportamiento Owner
  if (role === 'owner') {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader owner />
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <EmptyState
            title="Panel de propietario"
            copy="Los favoritos son para estudiantes. Ve a tu panel para gestionar tus alojamientos."
            action="Ir al panel"
            href="/propietario"
          />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold text-primary">Estudiante</p>
        <h1 className="mt-2 text-3xl font-bold">Mis favoritos</h1>
        <p className="mt-2 text-sm text-muted-foreground">Guarda los espacios que quieres comparar después.</p>
        
        <section className="mt-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 size={32} className="animate-spin" />
              <p className="mt-4 text-sm font-medium">Cargando favoritos...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 py-12 text-center text-red-600">
              <TriangleAlert size={32} />
              <p className="mt-4 font-bold">No se pudieron cargar tus favoritos</p>
              <button 
                type="button" 
                onClick={() => window.location.reload()} 
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
              >
                Reintentar
              </button>
            </div>
          ) : favorites.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map(fav => {
                const listing = fav.listing
                
                // Mapear los datos de Supabase a RoomCardData
                const coverImage = listing.listing_images?.find(img => img.is_cover) || listing.listing_images?.[0]
                
                const roomData: RoomCardData = {
                  id: listing.id,
                  title: listing.title,
                  district: listing.district,
                  price: listing.price_monthly,
                  distance: listing.university_nearby ? `Cerca de ${listing.university_nearby}` : '',
                  image: coverImage ? getListingImageUrl(coverImage.storage_path) : '',
                }

                return (
                  <div key={listing.id} className="relative">
                    {/* Si el alojamiento ya no estA disponible (pausado, en borrador, etc.) y aun asA- nos llegA3,
                        lo mostramos con un estado neutral. (Aunque RLS de favorites puede bloquearlo, si no lo bloquea,
                        el status es clave). */}
                    {listing.status !== 'published' && (
                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-white/70 backdrop-blur-[2px]">
                        <span className="rounded-full bg-zinc-800 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                          Alojamiento no disponible
                        </span>
                        <div className="absolute right-3 top-3">
                          <FavoriteButton 
                            listingId={listing.id} 
                            initialIsFavorite={true} 
                            onToggle={(isFav) => handleFavoriteRemoved(listing.id, isFav)} 
                          />
                        </div>
                      </div>
                    )}
                    
                    <RoomCard
                      room={roomData}
                      favoriteAction={
                        <FavoriteButton 
                          listingId={listing.id} 
                          initialIsFavorite={true} 
                          onToggle={(isFav) => handleFavoriteRemoved(listing.id, isFav)} 
                        />
                      }
                    />
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState 
              title="Aún no tienes alojamientos guardados" 
              copy="Guarda los que más te gusten para encontrarlos fácilmente aquí." 
              action="Buscar alojamientos" 
              href="/buscar" 
            />
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
