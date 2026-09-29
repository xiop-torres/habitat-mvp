'use client'

import Link from 'next/link'
import { use, useEffect, useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  Check,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Share2,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react'
import { AppHeader, Footer, Toast, VisitRequestModal } from '@/components/Shared'
import HabitatMap from '@/components/HabitatMap'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { ListingWithImages } from '@/lib/supabase/listings'
import { getListingImageUrl } from '@/lib/supabase/storage'



export default function PropertyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const [listing, setListing] = useState<ListingWithImages | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [saved, setSaved] = useState(false)
  const [visitOpen, setVisitOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    async function fetchListing() {
      if (!id) { setNotFound(true); setLoading(false); return }

      const supabase = createSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('listings')
        .select('*, listing_images(*)')
        .eq('id', id)
        .eq('status', 'published')   // solo listings públicos sin sesión
        .maybeSingle()

      if (error || !data) {
        setNotFound(true)
      } else {
        setListing(data as ListingWithImages)
      }
      setLoading(false)
    }
    fetchListing()
  }, [id])

  function shareListing() {
    if (listing && navigator.share) {
      navigator.share({ title: listing.title, text: 'Mira este alojamiento en Habitat', url: window.location.href })
    } else {
      navigator.clipboard?.writeText(window.location.href)
      setToast('Enlace copiado al portapapeles')
    }
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FEFDF8]">
        <AppHeader />
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="animate-spin text-[#EAB308]" size={36} />
        </div>
        <Footer />
      </div>
    )
  }

  // ── Not found / draft / paused / invalid UUID ────────────────────────────────
  if (notFound || !listing) {
    return (
      <div className="min-h-screen bg-[#FEFDF8] text-[#18181B]">
        <AppHeader />
        <main className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <TriangleAlert className="mx-auto text-[#EAB308]" size={48} />
          <h1 className="mt-6 text-3xl font-black">Alojamiento no disponible</h1>
          <p className="mt-3 text-sm text-[#71717A]">
            Este alojamiento no existe, fue dado de baja o no está disponible públicamente.
          </p>
          <Link
            href="/buscar"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#FACC15] px-6 py-3 text-sm font-black"
          >
            Ver otros alojamientos <ArrowRight size={16} />
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  // ── Datos reales ─────────────────────────────────────────────────────────────
  const hasRealImages = listing.listing_images && listing.listing_images.length > 0
  
  // Ordenar priorizando la portada y luego el sort_order
  const sortedImages = hasRealImages 
    ? [...listing.listing_images].sort((a, b) => {
        if (a.is_cover) return -1
        if (b.is_cover) return 1
        return a.sort_order - b.sort_order
      })
    : []

  const galleryImages = hasRealImages
    ? sortedImages.map((img) => getListingImageUrl(img.storage_path))
    : [] // vacío si no hay reales

  const hasCoordinates = listing.lat !== null && listing.lng !== null
  const mapHomes = hasCoordinates
    ? [{ id: listing.id, title: listing.title, district: listing.district, price: listing.price_monthly, lat: listing.lat!, lng: listing.lng! }]
    : []

  const availableFromFormatted = listing.available_from
    ? new Date(listing.available_from).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <div className="min-h-screen bg-[#FEFDF8] text-[#18181B] lg:pb-0">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

        {/* Breadcrumb + actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5">
          <nav className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#71717A]">
            <Link href="/buscar" className="hover:text-[#A16207]">Buscar</Link>
            <span>/</span>
            <span>Arequipa</span>
            <span>/</span>
            <span>{listing.district}</span>
            <span>/</span>
            <strong className="max-w-56 truncate text-[#18181B]">{listing.title}</strong>
          </nav>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={shareListing}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-[#D4D4D8] bg-white px-3 py-2 text-xs font-bold"
            >
              <Share2 size={14} /> Compartir
            </button>
            <button
              type="button"
              onClick={() => setSaved(!saved)}
              className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold ${saved ? 'border-[#FACC15] bg-[#FFF7CC]' : 'border-[#D4D4D8] bg-white'}`}
            >
              <Heart size={14} className={saved ? 'fill-[#FACC15]' : ''} />
              {saved ? 'Guardado' : 'Guardar'}
            </button>
          </div>
        </div>

        {/* Badges */}
        <section className="mb-7">
          <div className="flex flex-wrap gap-2">
            {listing.verified && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#A7F3D0] bg-[#E8F5F1] px-3 py-1.5 text-xs font-black text-[#047857]">
                <ShieldCheck size={14} /> Verificado presencialmente
              </span>
            )}
            {availableFromFormatted ? (
              <span className="rounded-full border border-[#A7F3D0] bg-[#E8F5F1] px-3 py-1.5 text-xs font-bold text-[#047857]">
                Disponible desde {availableFromFormatted}
              </span>
            ) : (
              <span className="rounded-full border border-[#A7F3D0] bg-[#E8F5F1] px-3 py-1.5 text-xs font-bold text-[#047857]">
                Disponible ahora
              </span>
            )}
            {listing.distance_label && (
              <span className="rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1.5 text-xs font-bold text-[#1D4ED8]">
                {listing.distance_label}
                {listing.university_nearby && ` de ${listing.university_nearby}`}
              </span>
            )}
          </div>
          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-[42px]">{listing.title}</h1>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#52525B]">
                <MapPin size={16} className="text-[#D97706]" />
                {listing.address_reference
                  ? `${listing.address_reference}, ${listing.district}`
                  : listing.district}
                {hasCoordinates && (
                  <> <span className="text-[#D4D4D8]">•</span>
                  <a href="#mapa-ubicacion" className="font-black text-[#A16207] underline">Ver en mapa</a>
                  </>
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section aria-label="Galería de imágenes" className="relative mb-9 overflow-hidden rounded-2xl">
          {!hasRealImages && (
            <div className="mb-2 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700">
              Las fotos reales del alojamiento estarán disponibles próximamente.
            </div>
          )}
          
          <div className="h-[300px] sm:h-[420px] md:h-[500px]">
            {galleryImages.length === 0 && (
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-zinc-100 text-zinc-400">
                Sin foto principal
              </div>
            )}

            {galleryImages.length === 1 && (
              <div className="relative h-full w-full overflow-hidden rounded-xl bg-zinc-100">
                <img src={galleryImages[0]} alt={listing.title} className="size-full object-cover transition duration-500 hover:scale-105" />
              </div>
            )}

            {galleryImages.length === 2 && (
              <div className="grid h-full grid-cols-2 gap-2">
                <div className="relative overflow-hidden rounded-l-xl bg-zinc-100"><img src={galleryImages[0]} alt={listing.title} className="size-full object-cover transition hover:scale-105" /></div>
                <div className="relative overflow-hidden rounded-r-xl bg-zinc-100"><img src={galleryImages[1]} alt={listing.title} className="size-full object-cover transition hover:scale-105" /></div>
              </div>
            )}

            {galleryImages.length === 3 && (
              <div className="grid h-full grid-cols-2 grid-rows-2 gap-2">
                <div className="relative row-span-2 overflow-hidden rounded-l-xl bg-zinc-100"><img src={galleryImages[0]} alt={listing.title} className="size-full object-cover transition hover:scale-105" /></div>
                <div className="relative overflow-hidden rounded-tr-xl bg-zinc-100"><img src={galleryImages[1]} alt={listing.title} className="size-full object-cover transition hover:scale-105" /></div>
                <div className="relative overflow-hidden rounded-br-xl bg-zinc-100"><img src={galleryImages[2]} alt={listing.title} className="size-full object-cover transition hover:scale-105" /></div>
              </div>
            )}

            {galleryImages.length === 4 && (
              <div className="grid h-full grid-cols-2 grid-rows-2 gap-2">
                <div className="relative overflow-hidden rounded-tl-xl bg-zinc-100"><img src={galleryImages[0]} alt={listing.title} className="size-full object-cover transition hover:scale-105" /></div>
                <div className="relative overflow-hidden rounded-tr-xl bg-zinc-100"><img src={galleryImages[1]} alt={listing.title} className="size-full object-cover transition hover:scale-105" /></div>
                <div className="relative overflow-hidden rounded-bl-xl bg-zinc-100"><img src={galleryImages[2]} alt={listing.title} className="size-full object-cover transition hover:scale-105" /></div>
                <div className="relative overflow-hidden rounded-br-xl bg-zinc-100"><img src={galleryImages[3]} alt={listing.title} className="size-full object-cover transition hover:scale-105" /></div>
              </div>
            )}

            {galleryImages.length >= 5 && (
              <div className="grid h-full gap-2 md:grid-cols-4 md:grid-rows-2">
                <div className="relative overflow-hidden rounded-xl bg-zinc-100 md:col-span-2 md:row-span-2 md:rounded-l-xl md:rounded-r-none">
                  <img src={galleryImages[0]} alt={listing.title} className="size-full object-cover transition duration-500 hover:scale-105" />
                </div>
                
                <div className="relative hidden overflow-hidden bg-zinc-100 md:block"><img src={galleryImages[1]} alt="Vista" className="size-full object-cover transition hover:scale-105" /></div>
                <div className="relative hidden overflow-hidden rounded-tr-xl bg-zinc-100 md:block"><img src={galleryImages[2]} alt="Vista" className="size-full object-cover transition hover:scale-105" /></div>
                <div className="relative hidden overflow-hidden bg-zinc-100 md:block"><img src={galleryImages[3]} alt="Vista" className="size-full object-cover transition hover:scale-105" /></div>
                <div className="relative hidden overflow-hidden rounded-br-xl bg-zinc-100 md:block">
                  <img src={galleryImages[4]} alt="Vista" className={`size-full object-cover transition hover:scale-105 ${galleryImages.length > 5 ? 'brightness-75' : ''}`} />
                  {galleryImages.length > 5 && (
                    <span className="absolute inset-0 grid place-items-center text-lg font-black text-white">
                      +{galleryImages.length - 5}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Body */}
        <div className="grid items-start gap-9 lg:grid-cols-12">
          <div className="space-y-7 lg:col-span-8">

            {/* Key specs */}
            <section className="grid grid-cols-2 gap-3 rounded-2xl border border-[#E4E4E7] bg-white p-4 shadow-sm sm:grid-cols-4">
              <KeySpec label="Tipo de espacio" value={listing.property_type} detail="Uso exclusivo" />
              <KeySpec label="Distrito" value={listing.district} detail="Arequipa, Perú" />
              <KeySpec label="Precio" value={`S/ ${listing.price_monthly.toFixed(0)}`} detail="Por mes" />
              <KeySpec
                label="Disponible desde"
                value={availableFromFormatted ?? 'Inmediato'}
                detail="Consultar al propietario"
              />
            </section>

            {/* Amenities / services */}
            {listing.amenities.length > 0 && (
              <section className="rounded-2xl border border-[#E4E4E7] bg-white p-5 shadow-sm sm:p-7">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-xl font-black">Lo que incluye este alojamiento</h2>
                  <span className="rounded-full bg-[#E8F5F1] px-2.5 py-1 text-[11px] font-black text-[#047857]">
                    {listing.amenities.length} servicios
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {listing.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-3 rounded-xl bg-[#F4F2EB] p-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#FFF7CC] text-[#D97706]">
                        <Check size={16} />
                      </span>
                      <span className="text-sm font-bold">{amenity}</span>
                    </div>
                  ))}
                </div>
                {listing.verified && (
                  <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#A7F3D0] bg-[#E8F5F1] p-4">
                    <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[#10B981] text-white">
                      <Check size={17} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black">Alojamiento auditado por Habitat Perú</h3>
                      <p className="mt-1 text-xs leading-5 text-[#52525B]">
                        Visitamos este inmueble y validamos los servicios y ubicación para que decidas con confianza.
                      </p>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Description */}
            {listing.description && (
              <section className="rounded-2xl border border-[#E4E4E7] bg-white p-5 shadow-sm sm:p-7">
                <h2 className="text-xl font-black">Descripción del espacio</h2>
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#52525B]">{listing.description}</p>
              </section>
            )}

            {/* Map */}
            <section id="mapa-ubicacion" className="rounded-2xl border border-[#E4E4E7] bg-white p-5 shadow-sm sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black">Ubicación</h2>
                  <p className="mt-1 text-xs text-[#71717A]">
                    {listing.district}, Arequipa
                    {listing.university_nearby && ` · Cerca de ${listing.university_nearby}`}
                  </p>
                </div>
              </div>
              <div className="mt-5">
                {hasCoordinates ? (
                  <HabitatMap homes={mapHomes} className="h-[300px] sm:h-[360px]" />
                ) : (
                  <div className="flex h-[200px] items-center justify-center rounded-2xl border border-dashed border-[#D4D4D8] bg-[#F4F2EB] text-center">
                    <div>
                      <MapPin className="mx-auto text-[#A1A1AA]" size={28} />
                      <p className="mt-2 text-sm font-bold text-[#71717A]">Ubicación exacta pendiente de configurar</p>
                      <p className="mt-1 text-xs text-[#A1A1AA]">El propietario publicará las coordenadas pronto.</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Rules */}
            {listing.rules.length > 0 && (
              <section className="rounded-2xl border border-[#E4E4E7] bg-white p-5 shadow-sm sm:p-7">
                <h2 className="text-xl font-black">Reglas de la casa y convivencia</h2>
                <div className="mt-4 space-y-3">
                  {listing.rules.map((rule) => (
                    <div key={rule} className="flex items-start gap-3 rounded-xl bg-[#F4F2EB] p-3 text-sm">
                      <span className="mt-1 size-2 shrink-0 rounded-full bg-[#FACC15]" />
                      <p>{rule}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="space-y-5 lg:sticky lg:top-24">

              {/* Booking card */}
              <section className="rounded-2xl border border-[#E4E4E7] bg-white p-5 shadow-lg sm:p-6">
                <div className="flex items-end justify-between border-b border-[#F0F0F1] pb-4">
                  <div>
                    <span className="text-3xl font-black">S/ {listing.price_monthly.toFixed(0)}</span>
                    <span className="text-sm text-[#71717A]"> / mes</span>
                  </div>
                </div>
                <div className="my-5 space-y-3">
                  <label className="grid gap-1 text-xs font-black">
                    Fecha estimada de llegada
                    <input type="date" className="field" />
                  </label>
                  <label className="grid gap-1 text-xs font-black">
                    Estadía académica
                    <select className="field">
                      <option>1 ciclo académico (4 - 5 meses)</option>
                      <option>1 año académico</option>
                    </select>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setVisitOpen(true)}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FACC15] px-4 py-3 text-sm font-black shadow-sm transition hover:bg-[#EAB308]"
                >
                  <CalendarDays size={17} /> Solicitar visita presencial o virtual
                </button>
                <button
                  type="button"
                  onClick={() => setToast('Mensajes disponibles próximamente')}
                  className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#18181B] px-4 py-3 text-sm font-black text-white"
                >
                  <MessageCircle size={17} className="text-[#10B981]" /> Contactar al propietario
                </button>
                <p className="mt-4 flex items-center justify-center gap-1 text-center text-[11px] text-[#A1A1AA]">
                  <ShieldCheck size={14} className="text-[#10B981]" /> Contacto directo sin intermediarios
                </p>
              </section>

              {/* Owner card — neutralizado, sin datos mock */}
              <section className="rounded-2xl border border-[#E4E4E7] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid size-12 place-items-center rounded-full bg-[#FACC15] font-black text-[#18181B]">
                    H
                  </div>
                  <div>
                    <h2 className="font-black">Propietario Habitat</h2>
                    <p className="text-xs text-[#71717A]">Propietario verificado Habitat</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-between border-t border-[#F0F0F1] pt-3 text-xs text-[#71717A]">
                  <span>Contacto disponible al coordinar visita</span>
                </div>
              </section>

              {/* University card */}
              {listing.university_nearby && (
                <section className="rounded-2xl border border-[#E4E4E7] bg-white p-5 shadow-sm">
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#71717A]">
                    Universidad más cercana
                  </p>
                  <div className="mt-3 flex items-center gap-3 rounded-xl bg-[#F4F2EB] p-3">
                    <div className="grid size-10 place-items-center rounded-lg bg-[#FFF7CC] text-[#A16207]">▦</div>
                    <div>
                      <h2 className="text-sm font-black">{listing.university_nearby}</h2>
                      {listing.distance_label && (
                        <p className="text-xs text-[#71717A]">{listing.distance_label}</p>
                      )}
                    </div>
                  </div>
                </section>
              )}

            </div>
          </aside>
        </div>

        {/* Similar listings — link to /buscar */}
        <section className="mt-14 border-t border-[#E4E4E7] pt-9">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black">Más alojamientos disponibles</h2>
              <p className="mt-1 text-sm text-[#71717A]">
                Explora otras opciones verificadas en Arequipa.
              </p>
            </div>
            <Link href="/buscar" className="inline-flex items-center gap-1 text-sm font-black text-[#A16207]">
              Ver todos <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-5 flex justify-center rounded-2xl border border-dashed border-[#E4E4E7] bg-white p-8 text-center">
            <div>
              <p className="text-sm font-bold text-[#71717A]">
                Los alojamientos similares se mostrarán aquí próximamente.
              </p>
              <Link href="/buscar" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#FACC15] px-5 py-2.5 text-sm font-black">
                Explorar todos los alojamientos <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
      <VisitRequestModal
        open={visitOpen}
        onClose={() => setVisitOpen(false)}
        onSubmitted={() => { setVisitOpen(false); setToast('Solicitud de visita enviada') }}
      />
      {toast && <Toast onClose={() => setToast('')}>{toast}</Toast>}
    </div>
  )
}

function KeySpec({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border border-[#F0F0F1] bg-[#F4F2EB] p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#71717A]">{label}</p>
      <p className="mt-1 text-sm font-black">{value}</p>
      <p className="mt-1 text-[11px] text-[#A16207]">{detail}</p>
    </div>
  )
}
