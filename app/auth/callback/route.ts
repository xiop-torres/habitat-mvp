import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Route Handler para procesar el callback de confirmación de email y magic links de Supabase Auth.
 * Compatible con Next.js 16 App Router y @supabase/ssr.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  // Priorizar NEXT_PUBLIC_APP_URL si está definido (ej. Vercel), o el origin de la petición (ej. localhost)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || origin

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const publishableKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !publishableKey) {
      return NextResponse.redirect(new URL('/login?error=missing_config', baseUrl))
    }

    let targetPath = '/buscar'
    let redirectResponse = NextResponse.redirect(new URL(targetPath, baseUrl))

    const supabase = createServerClient(supabaseUrl, publishableKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          redirectResponse = NextResponse.redirect(new URL(targetPath, baseUrl))
          cookiesToSet.forEach(({ name, value, options }) => {
            redirectResponse.cookies.set(name, value, options)
          })
        },
      },
    })

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Consultar el rol real en public.profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()

        if (profile?.role === 'owner') {
          targetPath = '/propietario'
        } else if (profile?.role === 'student') {
          targetPath = '/buscar'
        } else if (next && next.startsWith('/')) {
          targetPath = next
        }
      }

      // Respuesta final preservando las cookies de sesión
      const finalResponse = NextResponse.redirect(new URL(targetPath, baseUrl))
      redirectResponse.cookies.getAll().forEach((cookie) => {
        finalResponse.cookies.set(cookie.name, cookie.value, cookie)
      })

      return finalResponse
    }
  }

  // Redirección con error controlado si no hay código o el intercambio falló
  return NextResponse.redirect(new URL('/login?error=auth_callback', baseUrl))
}

