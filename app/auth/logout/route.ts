import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Route Handler para cerrar sesión (logout) en el servidor y limpiar cookies.
 */
export async function POST(request: NextRequest) {
  const { origin } = request.nextUrl
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || origin
  const loginUrl = new URL('/login', baseUrl)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !publishableKey) {
    return NextResponse.redirect(loginUrl)
  }

  let redirectResponse = NextResponse.redirect(loginUrl)

  const supabase = createServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        redirectResponse = NextResponse.redirect(loginUrl)
        cookiesToSet.forEach(({ name, value, options }) => {
          redirectResponse.cookies.set(name, value, options)
        })
      },
    },
  })

  await supabase.auth.signOut()

  return redirectResponse
}

export async function GET(request: NextRequest) {
  return POST(request)
}

