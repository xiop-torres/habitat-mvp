import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import Listing from '@/models/Listing'
import { getCurrentUser } from '@/lib/supabase/server'

export async function GET(request: Request) {
  await dbConnect()
  const { searchParams } = new URL(request.url)
  const filter: Record<string, unknown> = { status: 'published' }
  if (searchParams.get('mine') === '1') {
    const user = await getCurrentUser()
    if (!user?.id) return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 })
    filter.owner = user.id
    delete filter.status
  }
  const minPrice = Number(searchParams.get('minPrice'))
  const maxPrice = Number(searchParams.get('maxPrice'))
  if (minPrice || maxPrice) filter.price = { ...(minPrice ? { $gte: minPrice } : {}), ...(maxPrice ? { $lte: maxPrice } : {}) }
  const roomType = searchParams.get('roomType')
  if (roomType === 'private' || roomType === 'shared') filter.roomType = roomType
  const query = searchParams.get('q')
  if (query) filter.$or = [{ title: { $regex: query, $options: 'i' } }, { address: { $regex: query, $options: 'i' } }]
  const listings = await Listing.find(filter).sort({ createdAt: -1 }).limit(100)
  return NextResponse.json(listings)
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user?.id) return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 })
  try {
    await dbConnect()
    const listing = await Listing.create({ ...(await request.json()), owner: user.id })
    return NextResponse.json(listing, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo publicar el alojamiento.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}