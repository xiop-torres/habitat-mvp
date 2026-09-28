/**
 * Capa de datos para alojamientos (listings) en Habitat MVP.
 *
 * Todas las operaciones respetan RLS de Supabase.
 * La identidad del usuario se obtiene exclusivamente de Supabase Auth,
 * nunca de parámetros arbitrarios enviados por el navegador.
 *
 * Uso en Server Components / Route Handlers:
 *   import { getPublishedListings } from '@/lib/supabase/listings'
 *
 * Uso en Client Components:
 *   import { createBrowserListingsClient } from '@/lib/supabase/listings'
 */

import { createSupabaseServerClient } from './server'
import { createSupabaseBrowserClient } from './client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ListingStatus = 'draft' | 'published' | 'paused'

export interface ListingImage {
  id: string
  listing_id: string
  storage_path: string
  alt: string | null
  sort_order: number
  is_cover: boolean
  created_at: string
}

export interface Listing {
  id: string
  owner_id: string
  title: string
  description: string | null
  property_type: string
  district: string
  address_reference: string | null
  lat: number | null
  lng: number | null
  university_nearby: string | null
  distance_label: string | null
  price_monthly: number
  currency: 'PEN'
  amenities: string[]
  rules: string[]
  status: ListingStatus
  verified: boolean
  available_from: string | null
  created_at: string
  updated_at: string
}

/** Listing con imágenes incluidas (join eager). */
export interface ListingWithImages extends Listing {
  listing_images: ListingImage[]
}

/** Subconjunto de campos para crear un listing. owner_id lo provee RLS (auth.uid()). */
export type CreateListingInput = Omit<
  Listing,
  'id' | 'owner_id' | 'status' | 'verified' | 'created_at' | 'updated_at'
>

/** Subconjunto de campos actualizables por el propietario. */
export type UpdateListingInput = Partial<
  Omit<Listing, 'id' | 'owner_id' | 'verified' | 'created_at' | 'updated_at'>
>

// ---------------------------------------------------------------------------
// Server-side helpers (Server Components, Route Handlers, Server Actions)
// ---------------------------------------------------------------------------

/**
 * Devuelve todos los alojamientos publicados.
 * RLS filtra automáticamente los que no son `published` para usuarios anónimos.
 */
export async function getPublishedListings(): Promise<ListingWithImages[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('listings')
    .select('*, listing_images(*)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[listings] getPublishedListings:', error.message)
    return []
  }
  return (data ?? []) as ListingWithImages[]
}

/**
 * Devuelve un listing por ID.
 * Si el listing no es `published` y el usuario no es el propietario, RLS retorna null.
 */
export async function getListingById(id: string): Promise<ListingWithImages | null> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('listings')
    .select('*, listing_images(*)')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('[listings] getListingById:', error.message)
    return null
  }
  return (data ?? null) as ListingWithImages | null
}

/**
 * Devuelve todos los listings del propietario autenticado.
 * RLS garantiza que solo se devuelven listings cuyo owner_id === auth.uid().
 */
export async function getOwnerListings(): Promise<ListingWithImages[]> {
  const supabase = await createSupabaseServerClient()

  // Verificar sesión antes de consultar
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('listings')
    .select('*, listing_images(*)')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[listings] getOwnerListings:', error.message)
    return []
  }
  return (data ?? []) as ListingWithImages[]
}

/**
 * Crea un nuevo listing.
 * RLS asigna owner_id = auth.uid() automáticamente mediante policy INSERT.
 * El estado inicial es siempre `draft`.
 */
export async function createListing(input: CreateListingInput): Promise<Listing | null> {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('listings')
    .insert({
      ...input,
      owner_id: user.id,
      status: 'draft',
    })
    .select()
    .single()

  if (error) {
    console.error('[listings] createListing:', error.message)
    return null
  }
  return data as Listing
}

/**
 * Actualiza un listing existente.
 * RLS garantiza que solo el propietario puede modificarlo.
 */
export async function updateListing(
  id: string,
  input: UpdateListingInput
): Promise<Listing | null> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('listings')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[listings] updateListing:', error.message)
    return null
  }
  return data as Listing
}

/**
 * Cambia el estado (status) de un listing.
 * RLS garantiza que solo el propietario puede modificarlo.
 */
export async function setListingStatus(
  id: string,
  status: ListingStatus
): Promise<boolean> {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('listings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('[listings] setListingStatus:', error.message)
    return false
  }
  return true
}

/**
 * Elimina un listing. Solo el propietario puede hacerlo (RLS).
 * listing_images se elimina en cascada por la FK ON DELETE CASCADE.
 */
export async function deleteListing(id: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.from('listings').delete().eq('id', id)

  if (error) {
    console.error('[listings] deleteListing:', error.message)
    return false
  }
  return true
}

// ---------------------------------------------------------------------------
// Client-side helpers (Client Components)
// ---------------------------------------------------------------------------

/**
 * Devuelve un cliente Supabase configurado para el navegador listo para consultas de listings.
 * Úsalo en 'use client' components cuando necesites operaciones reactivas.
 *
 * Ejemplo:
 *   const supabase = createBrowserListingsClient()
 *   const { data } = await supabase.from('listings').select('*').eq('status', 'published')
 */
export function createBrowserListingsClient() {
  return createSupabaseBrowserClient()
}
