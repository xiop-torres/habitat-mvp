import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/server'

/**
 * GET /api/listings
 * - Sin parámetros: devuelve listings publicados (RLS filtra automáticamente).
 * - ?mine=1: devuelve los listings del propietario autenticado.
 * - ?district=...  ?maxPrice=...  ?type=... : filtros opcionales.
 */
export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { searchParams } = new URL(request.url)
  const mine = searchParams.get('mine') === '1'

  let query = supabase
    .from('listings')
    .select('*, listing_images(*)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (mine) {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 })
    }
    query = query.eq('owner_id', user.id)
  } else {
    query = query.eq('status', 'published')
  }

  const district = searchParams.get('district')
  if (district) query = query.ilike('district', `%${district}%`)

  const maxPrice = Number(searchParams.get('maxPrice'))
  if (maxPrice > 0) query = query.lte('price_monthly', maxPrice)

  const minPrice = Number(searchParams.get('minPrice'))
  if (minPrice > 0) query = query.gte('price_monthly', minPrice)

  const type = searchParams.get('type')
  if (type) query = query.ilike('property_type', `%${type}%`)

  const q = searchParams.get('q')
  if (q) query = query.or(`title.ilike.%${q}%,district.ilike.%${q}%`)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

/**
 * POST /api/listings
 * Crea un nuevo listing en estado `draft`.
 * owner_id se establece desde auth.uid() — no se acepta del body.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 })
  }

  const supabase = await createSupabaseServerClient()

  try {
    const body = await request.json()

    // Nunca aceptar owner_id del body — usar siempre la identidad autenticada
    const { owner_id: _discarded, ...safeBody } = body

    const { data, error } = await supabase
      .from('listings')
      .insert({
        ...safeBody,
        owner_id: user.id,
        status: 'draft',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'No se pudo publicar el alojamiento.' }, { status: 400 })
  }
}