'use server'
import { createSupabaseServerClient } from './server'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NotificationType = 'visit' | 'message' | 'favorite' | 'listing' | 'system'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string | null
  href: string | null
  read_at: string | null
  created_at: string
}

// ---------------------------------------------------------------------------
// getMyNotifications
// Returns up to 50 notifications for the authenticated user, newest first.
// Throws on Supabase error — never silently returns [].
// ---------------------------------------------------------------------------
export async function getMyNotifications(): Promise<Notification[]> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('No autorizado')

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)

  return data as Notification[]
}

// ---------------------------------------------------------------------------
// markNotificationAsRead
// Sets read_at = now() on a single notification owned by the current user.
// Skips the update if read_at is already set (avoids unnecessary writes).
// ---------------------------------------------------------------------------
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  // Only update if not already read — avoids triggering the immutability
  // trigger with an identical read_at value and saves a round-trip.
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', user.id)   // RLS also enforces this; explicit here for clarity
    .is('read_at', null)

  if (error) {
    console.error('markNotificationAsRead error:', error)
    return false
  }

  return true
}

// ---------------------------------------------------------------------------
// markAllNotificationsAsRead
// Sets read_at = now() on every unread notification of the current user.
// ---------------------------------------------------------------------------
export async function markAllNotificationsAsRead(): Promise<boolean> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null)

  if (error) {
    console.error('markAllNotificationsAsRead error:', error)
    return false
  }

  return true
}

// ---------------------------------------------------------------------------
// getUnreadNotificationCount
// Returns the exact count of unread notifications for the current user.
// ---------------------------------------------------------------------------
export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return 0

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('read_at', null)

  if (error) {
    console.error('getUnreadNotificationCount error:', error)
    return 0
  }

  return count ?? 0
}
