'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  ArrowRight,
  Check,
  Heart,
  ListFilter,
  Loader2,
  Map,
  MapPin,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  TriangleAlert,
} from 'lucide-react'
import { AppHeader, Footer } from '@/components/Shared'
import HabitatMap from '@/components/HabitatMap'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Listing } from '@/lib/supabase/listings'
import { getListingImageUrl } from '@/lib/supabase/storage'

// Filtros de UI — se aplican client-side sobre los datos reales
const universityFilters = ['UCSM', 'UNSA', 'Universidad Católica San Pablo', 'UTP', 'La Salle']
const accommodationFilters = ['Habitación individual', 'Habitación compartida', 'Departamento', 'Casa / Residencia']
const serviceFilters = ['WiFi', 'Agua caliente', 'Cocina equipada', 'Lavandería', 'Amoblado', 'Baño privado']



// Posiciones demo para el mapa (hasta que se implemente geocoding en 4E)
const mapPositions = [
  { lat: -16.394, lng: -71.542 },
  { lat: -16.39, lng: -71.535 },
  { lat: -16.397, lng: -71.53 },
  { lat: -16.403, lng: -71.539 },
  { lat: -16.408, lng: -71.544 },
  { lat: -16.4, lng: -71.532 },
]

export default function ListingsPage({
  initialCity = 'Arequipa',
  initialUniversity = '',
}: {
  initialCity?: string
  initialUniversity?: string
}) {
  // Data state
  const [allListings, setAllListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  // Filter state
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [maxPrice, setMaxPrice] = useState(2000)
  const [city] = useState(initialCity)
  const [university, setUniversity] = useState(initialUniversity)
  const [sort, setSort] = useState('Más relevantes')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showFilters, setShowFilters] = useState(true)

  // Fetch published listings — public page, no auth required
  useEffect(() => {
    async function fetchListings() {
      setLoading(true)
      setFetchError('')
      try {
        const supabase = createSupabaseBrowserClient()
        const { data, error } = await supabase
          .from('listings')
          .select('*, listing_images(*)')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(100)

        if (error) {
          setFetchError('No se pudieron cargar los alojamientos. Intenta de nuevo.')
        } else {
          setAllListings((data ?? []) as any) // o ListingWithImages[]
        }
      } catch {
        setFetchError('Error de conexión. Por favor recarga la página.')
      } finally {
        setLoading(false)
      }
    }
    fetchListings()
  }, [])

  function toggleValue(value: string, setter: (values: string[]) => void, current: string[]) {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
  }

  // Client-side filtering & sorting over real data
  const rooms = useMemo(() => {
    const filtered = allListings.filter((listing) => {
      // Universidad
      const uniValue = listing.university_nearby ?? ''
      const matchesUniversity =
        !university && selectedUniversities.length === 0
          ? true
          : selectedUniversities.some((u) => uniValue.toLowerCase().includes(u.toLowerCase())) ||
            uniValue.toLowerCase().includes(university.toLowerCase())

      // Tipo de alojamiento (property_type)
      const matchesType =
        selectedTypes.length === 0 ||
        selectedTypes.some((t) => listing.property_type.toLowerCase().includes(t.toLowerCase()))

      // Precio
      const matchesPrice = listing.price_monthly <= maxPrice

      // Servicios (amenities)
      const matchesServices =
        selectedServices.length === 0 ||
        selectedServices.every((service) =>
          listing.amenities.some((amenity) =>
            amenity.toLowerCase().includes(service.toLowerCase()),
          ),
        )

      return matchesUniversity && matchesType && matchesPrice && matchesServices
    })

    return [...filtered].sort((a, b) =>
      sort === 'Precio: menor a mayor'
        ? a.price_monthly - b.price_monthly
        : sort === 'Precio: mayor a menor'
          ? b.price_monthly - a.price_monthly
          : 0,
    )
  }, [allListings, university, selectedUniversities, selectedTypes, maxPrice, selectedServices, sort])

  // Map data — usa lat/lng reales si existen, posiciones demo si null
  const mapHomes = rooms.map((listing, index) => ({
    id: listing.id,
    title: listing.title,
    district: listing.district,
    price: listing.price_monthly,
    lat: listing.lat ?? mapPositions[index % mapPositions.length].lat,
    lng: listing.lng ?? mapPositions[index % mapPositions.length].lng,
  }))

  function clearFilters() {
    setSelectedUniversities([])
    setSelectedTypes([])
    setSelectedServices([])
    setMaxPrice(2000)
    setUniversity('')
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#18181B]">
      <AppHeader />
      <section className="border-b border-[#E4E4E7] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <nav className="mb-2 flex items-center gap-2 text-xs font-medium text-[#71717A]">
            <Link href="/" className="hover:text-[#18181B]">Inicio</Link>
            <span>/</span>
            <span className="font-bold text-[#18181B]">Resultados</span>
          </nav>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                Alojamientos cerca de {university || 'tu universidad'}
              </h1>
              <p className="mt-1 text-sm text-[#71717A]">
                <strong className="text-[#18181B]">
                  {loading ? '…' : `${rooms.length} alojamientos`}
                </strong>{' '}
                en {city || 'Arequipa'} · Encuentra tu próximo hogar.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E4E7] bg-[#F4F2EB] px-3 py-1.5">
                <MapPin size={13} /> {city || 'Arequipa'}
              </span>
              {university && (
                <span className="rounded-full border border-[#E4E4E7] bg-[#F4F2EB] px-3 py-1.5">
                  {university}
                </span>
              )}
              <span className="rounded-full border border-[#FACC15]/50 bg-[#FFF7CC] px-3 py-1.5">
                Hasta S/ {maxPrice.toLocaleString('es-PE')}
              </span>
              <Link
                href="/#buscar"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#D4D4D8] bg-white px-3 py-1.5 font-bold hover:border-[#18181B]"
              >
                <Settings2 size={13} /> Modificar búsqueda
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setShowFilters(!showFilters)
              setShowMobileFilters(!showMobileFilters)
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-[#D4D4D8] bg-white px-4 py-2.5 text-sm font-bold transition hover:border-[#18181B]"
          >
            <SlidersHorizontal size={17} /> {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          </button>
          <p className="text-xs font-semibold text-[#71717A]">
            {showFilters ? 'Ajusta tu búsqueda desde el panel' : 'Vista amplia del catálogo y el mapa'}
          </p>
        </div>

        <div className="grid items-start gap-7 lg:grid-cols-12">
          {/* Filters sidebar */}
          <aside
            className={`${showFilters && showMobileFilters ? 'block' : 'hidden'} ${showFilters ? 'lg:block' : ''} rounded-2xl border border-[#E4E4E7] bg-white p-5 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] lg:col-span-3`}
          >
            <div className="flex items-center justify-between border-b border-[#F0F0F1] pb-4">
              <div className="flex items-center gap-2">
                <ListFilter size={18} />
                <h2 className="text-lg font-black">Filtros</h2>
              </div>
              <button type="button" onClick={clearFilters} className="text-xs font-bold text-[#71717A] underline">
                Limpiar todo
              </button>
            </div>

            <FilterGroup title="Universidad">
              {universityFilters.map((item) => (
                <CheckFilter
                  key={item}
                  label={item}
                  checked={selectedUniversities.includes(item) || university === item}
                  onChange={() => toggleValue(item, setSelectedUniversities, selectedUniversities)}
                  count={allListings.filter((l) => (l.university_nearby ?? '').toLowerCase().includes(item.toLowerCase())).length}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Tipo de alojamiento">
              {accommodationFilters.map((item) => (
                <CheckFilter
                  key={item}
                  label={item}
                  checked={selectedTypes.includes(item)}
                  onChange={() => toggleValue(item, setSelectedTypes, selectedTypes)}
                  count={allListings.filter((l) => l.property_type.toLowerCase().includes(item.toLowerCase())).length}
                />
              ))}
            </FilterGroup>

            <div className="border-b border-[#F0F0F1] py-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-black">Precio mensual</h3>
                <span className="rounded border border-[#FDE68A] bg-[#FFF7CC] px-2 py-0.5 text-[11px] font-black">
                  S/ 300 - S/ {maxPrice.toLocaleString('es-PE')}
                </span>
              </div>
              <input
                aria-label="Precio máximo mensual"
                type="range"
                min="300"
                max="2000"
                step="50"
                value={maxPrice}
                onChange={(event) => setMaxPrice(Number(event.target.value))}
                className="h-1.5 w-full accent-[#FACC15]"
              />
              <div className="mt-2 flex justify-between text-[11px] font-semibold text-[#71717A]">
                <span>S/ 300</span>
                <span>S/ 1,200</span>
                <span>S/ 2,000+</span>
              </div>
            </div>

            <FilterGroup title="Servicios incluidos">
              {serviceFilters.map((item) => (
                <CheckFilter
                  key={item}
                  label={item}
                  checked={selectedServices.includes(item)}
                  onChange={() => toggleValue(item, setSelectedServices, selectedServices)}
                  count={allListings.filter((l) => l.amenities.some((a) => a.toLowerCase().includes(item.toLowerCase()))).length}
                />
              ))}
            </FilterGroup>

            <button
              type="button"
              onClick={() => setShowMobileFilters(false)}
              className="mt-5 w-full rounded-xl bg-[#FACC15] px-4 py-3 text-sm font-black shadow-sm transition hover:bg-[#EAB308]"
            >
              Aplicar filtros
            </button>
          </aside>

          {/* Listings grid */}
          <section className={showFilters ? 'lg:col-span-5' : 'lg:col-span-7'}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-black">
                {loading ? 'Cargando…' : `${rooms.length} alojamientos encontrados`}
              </p>
              <div className="flex items-center gap-2 text-xs text-[#71717A]">
                <span>Ordenar por:</span>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="border-0 bg-transparent py-1 pl-0 pr-6 text-xs font-black text-[#18181B] outline-none"
                >
                  <option>Más relevantes</option>
                  <option>Precio: menor a mayor</option>
                  <option>Precio: mayor a menor</option>
                </select>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between rounded-xl border border-[#E4E4E7] bg-white p-1.5 text-xs font-bold sm:hidden">
              <span className="px-2 text-[#71717A]">Vista del catálogo</span>
              <button type="button" className="rounded-lg bg-[#FACC15] px-3 py-1.5">Lista</button>
              <button type="button" className="rounded-lg px-3 py-1.5 text-[#71717A]">
                <Map size={13} className="inline" /> Mapa
              </button>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#E4E4E7] bg-white px-6 py-16 text-center">
                <Loader2 className="animate-spin text-[#EAB308]" size={32} />
                <p className="text-sm font-black text-[#71717A]">Buscando alojamientos…</p>
              </div>
            )}

            {/* Error */}
            {!loading && fetchError && (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 px-6 py-16 text-center">
                <TriangleAlert className="text-red-500" size={32} />
                <p className="text-sm font-black text-red-700">{fetchError}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="rounded-xl bg-[#FACC15] px-4 py-2.5 text-sm font-black"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* Results */}
            {!loading && !fetchError && rooms.length > 0 && (
              <div className="grid gap-5 sm:grid-cols-2">
                {rooms.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                  />
                ))}
              </div>
            )}

            {/* No results after filtering */}
            {!loading && !fetchError && allListings.length > 0 && rooms.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#D4D4D8] bg-white px-6 py-16 text-center">
                <Sparkles className="mx-auto text-[#EAB308]" />
                <h2 className="mt-4 text-lg font-black">No encontramos alojamientos con estos filtros</h2>
                <p className="mt-2 text-sm text-[#71717A]">Prueba ampliando el precio o quitando algún filtro.</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-xl bg-[#FACC15] px-4 py-2.5 text-sm font-black"
                >
                  Limpiar filtros
                </button>
              </div>
            )}

            {/* Empty — no listings published yet */}
            {!loading && !fetchError && allListings.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#D4D4D8] bg-white px-6 py-16 text-center">
                <Sparkles className="mx-auto text-[#EAB308]" />
                <h2 className="mt-4 text-lg font-black">Aún no hay alojamientos publicados</h2>
                <p className="mt-2 text-sm text-[#71717A]">
                  Sé el primero en publicar un espacio para universitarios.
                </p>
              </div>
            )}

            {/* Pagination — demo, se implementará con paginación real cuando haya más listings */}
            {!loading && !fetchError && rooms.length > 0 && (
              <div className="mt-6 flex items-center justify-between border-t border-[#D4D4D8] pt-4">
                <div className="flex items-center gap-1">
                  <span className="grid size-8 place-items-center rounded-lg bg-[#FACC15] text-xs font-black">1</span>
                </div>
                <span className="hidden text-xs text-[#71717A] sm:block">{rooms.length} resultados</span>
              </div>
            )}
          </section>

          {/* Map */}
          <section className={showFilters ? 'lg:sticky lg:top-24 lg:col-span-4' : 'lg:sticky lg:top-24 lg:col-span-5'}>
            <HabitatMap homes={mapHomes} className="h-[520px] lg:h-[680px]" />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-b border-[#F0F0F1] py-5">
      <h3 className="mb-3 text-sm font-black">{title}</h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  )
}

function CheckFilter({
  label,
  checked,
  onChange,
  count,
}: {
  label: string
  checked: boolean
  onChange: () => void
  count: number
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-2 text-xs font-medium text-[#52525B]">
      <span className="flex min-w-0 items-center gap-2.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="size-4 rounded border-[#D4D4D8] text-[#18181B] accent-[#18181B]"
        />
        <span className="truncate">{label}</span>
      </span>
      <span className="font-mono text-[#A1A1AA]">({count})</span>
    </label>
  )
}

function ListingCard({ listing }: { listing: any }) {
  let coverUrl = null
  if (listing.listing_images && listing.listing_images.length > 0) {
    const coverImg = listing.listing_images.find((i: any) => i.is_cover) || listing.listing_images[0]
    if (coverImg) coverUrl = getListingImageUrl(coverImg.storage_path)
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative h-44 overflow-hidden bg-[#E4E4E7]">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={listing.title}
            className="size-full object-cover transition duration-300 group-hover:scale-105 bg-zinc-100"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-xs font-medium text-zinc-400">
            Sin imagen
          </div>
        )}
        {listing.verified && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#047857]/90 px-2.5 py-1 text-[11px] font-black text-white">
            <Check size={12} /> Verificado
          </span>
        )}
        <button
          type="button"
          aria-label={`Guardar ${listing.title}`}
          className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-white/85 text-[#52525B] shadow-sm"
        >
          <Heart size={15} />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-sm font-black leading-snug">{listing.title}</h3>
          <p className="shrink-0 text-right text-base font-black">
            S/ {listing.price_monthly.toFixed(0)}
            <span className="block text-[11px] font-medium text-[#71717A]">/mes</span>
          </p>
        </div>
        <p className="mt-1 text-xs font-medium text-[#71717A]">
          {listing.district}
          {listing.university_nearby && ` · Cerca de ${listing.university_nearby}`}
          {listing.distance_label && ` · ${listing.distance_label}`}
        </p>
        {listing.amenities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {listing.amenities.slice(0, 3).map((item: string) => (
              <span key={item} className="rounded bg-[#F4F2EB] px-2 py-0.5 text-[10px] font-semibold text-[#52525B]">
                {item}
              </span>
            ))}
          </div>
        )}
        {/* Link uses real UUID — /alojamiento/[id] still shows mock in 4E until migrated */}
        <Link
          href={`/alojamiento/${listing.id}`}
          className="mt-4 flex items-center justify-end gap-1 border-t border-[#F0F0F1] pt-3 text-xs font-black hover:text-[#A16207]"
        >
          Ver detalles <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  )
}
