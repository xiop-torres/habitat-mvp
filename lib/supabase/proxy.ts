import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Helper para refrescar la sesión de Supabase Auth en Next.js App Router (Proxy / Middleware).
 * Garantiza que los tokens JWT de sesión se renueven automáticamente y se escriban
 * de vuelta en las cookies de la respuesta HTTP antes de renderizar la página.
 * Además, implementa la protección de rutas privadas y control de acceso por rol (profiles.role).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !publishableKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // 1. Obtener usuario autenticado validando el JWT contra Supabase Auth
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Helper para construir respuestas de redirección preservando cookies de sesión
  function createRedirectResponse(targetPath: string) {
    const redirectUrl = new URL(targetPath, request.url)
    const redirectResponse = NextResponse.redirect(redirectUrl)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return redirectResponse
  }

  // 2. Definición de rutas exclusivas de propietario
  // /propietario, /propietario/nuevo, /propietario/editar/*, /propietario/solicitudes, etc.
  // Notar que '/propietarios' (plural) es la landing comercial pública y NO debe bloquearse.
  const isOwnerRoute =
    pathname === '/propietario' ||
    pathname.startsWith('/propietario/') ||
    pathname.startsWith('/dashboard')

  if (isOwnerRoute) {
    if (!user) {
      // Usuario no autenticado intentando entrar a ruta de propietario -> /login
      return createRedirectResponse('/login')
    }

    // Usuario autenticado -> consultar rol real en public.profiles respaldado por base de datos
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.role !== 'owner' && profile?.role !== 'admin') {
      // Si un estudiante intenta entrar en una ruta exclusiva de propietario -> /buscar
      return createRedirectResponse('/buscar')
    }

    return supabaseResponse
  }

  // 3. Definición de rutas privadas generales / de estudiante
  // /favoritos, /visitas, /mensajes, /notificaciones, /perfil
  const isStudentPrivateRoute =
    pathname === '/favoritos' ||
    pathname.startsWith('/favoritos/') ||
    pathname === '/visitas' ||
    pathname.startsWith('/visitas/') ||
    pathname === '/mensajes' ||
    pathname.startsWith('/mensajes/') ||
    pathname === '/notificaciones' ||
    pathname.startsWith('/notificaciones/') ||
    pathname === '/perfil' ||
    pathname.startsWith('/perfil/')

  if (isStudentPrivateRoute) {
    if (!user) {
      // Usuario no autenticado intentando entrar a ruta privada -> /login
      return createRedirectResponse('/login')
    }

    return supabaseResponse
  }

  return supabaseResponse
}
