import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { User, Session } from '@supabase/supabase-js'

export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !publishableKey) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.')
  }

  const cookieStore = await cookies()

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Puede ejecutarse desde Server Components donde setear cookies no aplica.
        }
      },
    },
  })
}

/**
 * Obtiene el usuario autenticado actualmente desde el servidor (Server Component, Route Handler o Server Action).
 * Utiliza auth.getUser() que valida el JWT contra el servidor de Supabase Auth,
 * garantizando que no se usen tokens manipulados en cookies.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createSupabaseServerClient()
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
 * Obtiene la sesión actual desde las cookies en el servidor.
 */
export async function getCurrentSession(): Promise<Session | null> {
  try {
    const supabase = await createSupabaseServerClient()
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
 * Helper booleano para verificar si la petición proviene de un usuario autenticado.
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null
}

/**
 * Cierra la sesión activa en el servidor y limpia las cookies asociadas.
 */
export async function signOutServer() {
  const supabase = await createSupabaseServerClient()
  return await supabase.auth.signOut()
}
