'use server'

import { createSupabaseServerClient } from './server'

// Mapeo exacto del ENUM en la BD
export type VisitStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'rescheduled' | 'completed'
export type VisitMode = 'presencial' | 'virtual'

export interface VisitRequest {
  id: string
  listing_id: string
  student_id: string
  owner_id: string
  requested_date: string
  requested_time: string
  mode: VisitMode
  message: string | null
  status: VisitStatus
  created_at: string
  updated_at: string
  listing?: any // Join details
  student?: any // Join details
}

export async function getStudentVisits(): Promise<VisitRequest[]> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('visit_requests')
    .select(`
      *,
      listing:listings (
        id,
        title,
        district,
        price_monthly,
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
    console.error('[visits] getStudentVisits error:', error)
    throw new Error(error.message)
  }

  return data as VisitRequest[]
}

export async function getOwnerVisits(): Promise<VisitRequest[]> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('visit_requests')
    .select(`
      *,
      listing:listings (
        id,
        title,
        district,
        price_monthly,
        status,
        listing_images (
          storage_path,
          is_cover
        )
      ),
      student:profiles!visit_requests_student_id_fkey (
        first_name,
        last_name,
        phone,
        avatar_url
      )
    `)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[visits] getOwnerVisits error:', error)
    throw new Error(error.message)
  }

  return data as VisitRequest[]
}

export async function createVisitRequest(params: {
  listingId: string
  requestedDate: string
  requestedTime: string
  mode: VisitMode
  message?: string
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'No autorizado' }
  }

  // 1. Obtener informaciA3n del listing y validar
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('owner_id, status')
    .eq('id', params.listingId)
    .maybeSingle()

  if (listingError || !listing) {
    return { success: false, error: 'Alojamiento no encontrado.' }
  }

  if (listing.status !== 'published') {
    return { success: false, error: 'El alojamiento ya no estA disponible para visitas.' }
  }

  // 2. Insertar utilizando la informaciA3n validada
  const { error } = await supabase
    .from('visit_requests')
    .insert({
      student_id: user.id,
      listing_id: params.listingId,
      owner_id: listing.owner_id, // Derivado de base de datos
      requested_date: params.requestedDate,
      requested_time: params.requestedTime,
      mode: params.mode,
      message: params.message || null,
      status: 'pending' // Forzado (RLS tambiAcn lo validarA)
    })

  if (error) {
    console.error('[visits] createVisitRequest error:', error)
    // 23505 es el cA3digo de violaciA3n de UNIQUE en PostgreSQL
    if (error.code === '23505') {
      return { success: false, error: 'Ya has solicitado una visita para esa fecha y hora.' }
    }
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function updateVisitStatus(
  visitId: string, 
  newStatus: VisitStatus, 
  rescheduleData?: { requestedDate: string; requestedTime: string }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autorizado' }

  // Obtener rol del usuario
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  
  // Validaciones BÁSICAS en servidor
  if (profile?.role === 'student' && newStatus !== 'cancelled') {
    return { success: false, error: 'Los estudiantes solo pueden cancelar solicitudes.' }
  }

  const updatePayload: any = { status: newStatus }
  
  // Agregar datos de reprogramaciA3n si aplica
  if (newStatus === 'rescheduled' && rescheduleData) {
    updatePayload.requested_date = rescheduleData.requestedDate
    updatePayload.requested_time = rescheduleData.requestedTime
  }

  const { error } = await supabase
    .from('visit_requests')
    .update(updatePayload)
    .eq('id', visitId)

  if (error) {
    console.error('[visits] updateVisitStatus error:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
