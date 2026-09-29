import { createSupabaseBrowserClient } from './client'

export const STORAGE_BUCKETS = {
  LISTINGS: 'listing-images',
} as const

export const STORAGE_LIMITS = {
  MAX_FILE_SIZE_MB: 5,
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024,
  MAX_FILES_PER_LISTING: 5, // Límite arbitrario para MVP (Free Tier)
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const

/**
 * Genera la ruta segura para almacenar la imagen de un listing.
 * Formato requerido por RLS: owner_id/listing_id/filename
 */
export function getListingStoragePath(ownerId: string, listingId: string, filename: string): string {
  // Limpiar el nombre de archivo para evitar caracteres problemáticos
  const safeFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, '').toLowerCase()
  const timestamp = Date.now()
  return `${ownerId}/${listingId}/${timestamp}-${safeFilename}`
}

/**
 * Obtiene la URL pública absoluta de una imagen almacenada.
 * Se puede usar tanto en el server como en el client, ya que no depende de sesión.
 */
export function getListingImageUrl(path: string): string {
  // Si ya es una URL completa (ej. placeholder), retornarla
  if (path.startsWith('http://') || path.startsWith('https://')) return path

  // En un componente de cliente, instanciamos directamente.
  // getPublicUrl es una función síncrona que solo concatena strings usando el SUPABASE_URL local.
  const supabase = createSupabaseBrowserClient()
  const { data } = supabase.storage.from(STORAGE_BUCKETS.LISTINGS).getPublicUrl(path)
  
  return data.publicUrl
}
