'use client'

import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from './client'

export interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  role: 'student' | 'owner' | 'admin'
  phone?: string | null
  university?: string | null
  district?: string | null
  avatar_url?: string | null
}

/**
 * Extrae las iniciales del usuario para usarlas en avatares cuando no hay foto.
 */
export function getInitials(firstName?: string | null, lastName?: string | null): string {
  const f = firstName?.trim().charAt(0) || ''
  const l = lastName?.trim().charAt(0) || ''
  const initials = `${f}${l}`.toUpperCase()
  return initials || 'U'
}

/**
 * Hook para obtener la identidad y datos del perfil del usuario autenticado en tiempo real.
 * Consulta auth.users y public.profiles en Supabase, reaccionando a cambios de sesión.
 */
export function useCurrentUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function fetchProfile() {
      try {
        const supabase = createSupabaseBrowserClient()
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
          if (isMounted) {
            setProfile(null)
            setLoading(false)
          }
          return
        }

        // Consultar el perfil real en public.profiles respaldado por RLS
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name, role, phone, university, district, avatar_url')
          .eq('id', user.id)
          .maybeSingle()

        if (isMounted) {
          if (data && !profileError) {
            setProfile(data as UserProfile)
          } else {
            // Fallback con datos de sesión mientras se resuelve la sincronización
            const meta = user.user_metadata || {}
            setProfile({
              id: user.id,
              email: user.email || '',
              first_name: meta.first_name || 'Usuario',
              last_name: meta.last_name || '',
              role: (meta.role as any) || 'student',
              phone: meta.phone || null,
              university: meta.university || null,
              district: null,
              avatar_url: null,
            })
          }
          setLoading(false)
        }
      } catch {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchProfile()

    // Suscribirse a cambios de estado de autenticación (login, logout, token refresh)
    const supabase = createSupabaseBrowserClient()
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        if (isMounted) {
          setProfile(null)
          setLoading(false)
        }
      } else {
        fetchProfile()
      }
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  return { profile, loading }
}

