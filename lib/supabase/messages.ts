'use server'
import { createSupabaseServerClient } from './server'

export interface Conversation {
  id: string
  listing_id: string
  student_id: string
  owner_id: string
  created_at: string
  updated_at: string
  listing?: any
  student?: any
  owner?: any
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  read_at: string | null
  created_at: string
}

export async function getOrCreateConversation(listingId: string): Promise<string> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('No autorizado')
  }

  // Verificar rol del estudiante
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'student') {
    throw new Error('Solo los estudiantes pueden iniciar una conversación por un alojamiento.')
  }

  // Verificar listing y obtener owner_id
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('owner_id, status')
    .eq('id', listingId)
    .single()

  if (listingError || !listing) {
    throw new Error('Alojamiento no encontrado')
  }

  if (listing.status !== 'published') {
    throw new Error('El alojamiento no está publicado')
  }

  if (listing.owner_id === user.id) {
    throw new Error('No puedes iniciar una conversación contigo mismo')
  }

  // Intentar obtener o crear la conversación
  // Primero intentamos buscarla
  const { data: existingConv } = await supabase
    .from('conversations')
    .select('id')
    .eq('listing_id', listingId)
    .eq('student_id', user.id)
    .eq('owner_id', listing.owner_id)
    .maybeSingle()

  if (existingConv) {
    return existingConv.id
  }

  // Si no existe, intentamos crearla
  const { data: newConv, error: insertError } = await supabase
    .from('conversations')
    .insert({
      listing_id: listingId,
      student_id: user.id,
      owner_id: listing.owner_id,
    })
    .select('id')
    .single()

  if (insertError) {
    // Si hubo una carrera por el UNIQUE, el código de error en Postgres es 23505
    if (insertError.code === '23505') {
      const { data: retryConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', listingId)
        .eq('student_id', user.id)
        .eq('owner_id', listing.owner_id)
        .single()
      
      if (retryConv) return retryConv.id
    }
    throw new Error(insertError.message)
  }

  return newConv.id
}

export async function getMyConversations() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('No autorizado')

  // Supabase RLS garantizará que solo traigamos donde somos student o owner
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id,
      created_at,
      updated_at,
      listing:listings (
        id,
        title,
        listing_images (
          storage_path,
          is_cover
        )
      ),
      student:profiles!conversations_student_id_fkey (
        id,
        first_name,
        last_name,
        avatar_url
      ),
      owner:profiles!conversations_owner_id_fkey (
        id,
        first_name,
        last_name,
        avatar_url
      )
    `)
    .order('updated_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  const supabase = await createSupabaseServerClient()
  
  // RLS garantizará que solo los participantes puedan leer los mensajes
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data as Message[]
}

export async function sendMessage(conversationId: string, body: string) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('No autorizado')

  const trimmedBody = body.trim()
  if (!trimmedBody) {
    throw new Error('El mensaje no puede estar vacío')
  }

  if (trimmedBody.length > 1000) {
    throw new Error('El mensaje es demasiado largo (máximo 1000 caracteres)')
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      body: trimmedBody
    })
    .select('*')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}
export async function markConversationAsRead(conversationId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  // Verificar explícitamente que el usuario es participante de la conversación
  // antes de ejecutar el UPDATE (doble capa: además de RLS).
  const { data: conv, error: convError } = await supabase
    .from('conversations')
    .select('id')
    .eq('id', conversationId)
    .or(`student_id.eq.${user.id},owner_id.eq.${user.id}`)
    .maybeSingle()

  if (convError || !conv) return false

  // Marcar solo los mensajes recibidos (sender_id !== yo) que aún no se han leído.
  // El trigger tr_message_immutable garantiza que SOLO read_at pueda cambiar.
  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id)
    .is('read_at', null)

  if (error) {
    console.error('Error marking as read:', error)
    return false
  }

  return true
}
