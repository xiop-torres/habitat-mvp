import { createBrowserClient } from '@supabase/ssr'
import type { User, Session } from '@supabase/supabase-js'

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !publishableKey) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.')
  }

  return createBrowserClient(url, publishableKey)
}

/**
 * Obtiene el usuario autenticado desde el navegador (Client Components).
 */
export async function getClientUser(): Promise<User | null> {
  try {
    const supabase = createSupabaseBrowserClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) return null
    return user
  } catch {
    return null
  }
}

/**
 * Obtiene la sesión actual desde el navegador.
 */
export async function getClientSession(): Promise<Session | null> {
  try {
    const supabase = createSupabaseBrowserClient()
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error || !session) return null
    return session
  } catch {
    return null
  }
}

/**
 * Helper booleano para verificar en cliente si hay un usuario autenticado.
 */
export async function isClientAuthenticated(): Promise<boolean> {
  const user = await getClientUser()
  return user !== null
}

/**
 * Cierra la sesión activa en el navegador.
 */
export async function signOutClient() {
  const supabase = createSupabaseBrowserClient()
  return await supabase.auth.signOut()
}
