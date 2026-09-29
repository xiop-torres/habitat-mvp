'use server'
/**
 * Capa de datos para favoritos en Habitat MVP.
 *
 * Todas las operaciones respetan RLS de Supabase.
 * La identidad del usuario se obtiene exclusivamente de Supabase Auth.
 */

import { createSupabaseServerClient } from './server'

export interface FavoriteListing {
  id: string
  title: string
  district: string
  price_monthly: number
  university_nearby: string | null
  status: string
  listing_images: {
    storage_path: string
    is_cover: boolean
  }[]
}

export interface Favorite {
  created_at: string
  listing: FavoriteListing
}

/**
 * Obtiene todos los favoritos del estudiante autenticado.
 * Solo trae la información necesaria del alojamiento para las cards.
 */
export async function getStudentFavorites(): Promise<Favorite[]> {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  // RLS ya filtra por student_id = auth.uid(), pero lo especificamos por claridad
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      created_at,
      listing:listings (
        id,
        title,
        district,
        price_monthly,
        university_nearby,
        status,
        listing_images (
          storage_path,
          is_cover
        )
      )
    `)
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[favorites] getStudentFavorites:', error.message)
    return []
  }
  
  // Clean up format and type assert. 
  // In Supabase with 1-to-1 or inner joins, listing comes back as an object.
  // We can filter out cases where the listing might be null (e.g., if deleted, though CASCADE handles that).
  return (data as any[]).filter(f => f.listing).map(f => ({
    created_at: f.created_at,
    listing: f.listing as FavoriteListing
  }))
}

/**
 * Comprueba si un listing especAfico estA en los favoritos del usuario actual.
 */
export async function isListingFavorite(listingId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase
    .from('favorites')
    .select('created_at')
    .eq('student_id', user.id)
    .eq('listing_id', listingId)
    .maybeSingle()

  if (error) {
    console.error('[favorites] isListingFavorite:', error.message)
    return false
  }

  return !!data
}

/**
 * Agrega un listing a los favoritos del estudiante actual.
 */
export async function addFavorite(listingId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('favorites')
    .insert({
      student_id: user.id,
      listing_id: listingId
    })

  if (error) {
    console.error('[favorites] addFavorite:', error.message)
    return false
  }
  
  return true
}

/**
 * Elimina un listing de los favoritos del estudiante actual.
 */
export async function removeFavorite(listingId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('student_id', user.id)
    .eq('listing_id', listingId)

  if (error) {
    console.error('[favorites] removeFavorite:', error.message)
    return false
  }
  
  return true
}
