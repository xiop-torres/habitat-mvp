'use client'

import Link from 'next/link'
import { useMemo, useState, type ReactNode } from 'react'
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
import { FavoriteButton } from '@/components/FavoriteButton'
import { getListingImageUrl } from '@/lib/supabase/storage'
import { resolveUniversity } from '@/lib/universities'

// Filtros de UI — se aplican client-side sobre los datos reales
const universityFilters = ['UCSM', 'UNSA', 'Universidad Católica San Pablo', 'UTP']
const accommodationFilters = ['Habitación individual', 'Habitación compartida', 'Departamento', 'Casa / Residencia']
const serviceFilters = ['WiFi', 'Agua caliente', 'Cocina equipada', 'Lavandería', 'Amoblado', 'Baño privado']

export default function ListingsClient({
  initialCity = 'Arequipa',
  initialUniversity = '',
  initialListings = [],
}: {
  initialCity?: string
  initialUniversity?: string
  initialListings: any[]
}) {
  // Data state - ya no hay loading ni error porque viene del servidor
  const [allListings] = useState<any[]>(initialListings)

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

  function toggleValue(value: string, setter: (values: string[]) => void, current: string[]) {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
  }

  // Client-side filtering & sorting over real data
  const rooms = useMemo(() => {
    const filtered = allListings.filter((listing) => {
      // Universidad
      const uniValue = listing.university_nearby ?? ''
      const listingUni = resolveUniversity(uniValue)
      const activeUnies = [...selectedUniversities, university].filter(Boolean)
      
      const matchesUniversity =
        activeUnies.length === 0
          ? true
          : activeUnies.some((u) => {
              const activeUni = resolveUniversity(u)
              if (activeUni && listingUni) {
                return activeUni.id === listingUni.id
              }
              return uniValue.toLowerCase().includes(u.toLowerCase())
            })

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
          listing.amenities.some((amenity: string) =>
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

  // Map data excluye los que no tienen coordenadas
  // Las coordenadas ya vienen aproximadas desde el servidor en lat/lng
  const mapHomes = rooms
    .filter((listing) => listing.lat !== null && listing.lng !== null)
    .map((listing) => {
      let coverUrl = null
      if (listing.listing_images && listing.listing_images.length > 0) {
        const coverImg = listing.listing_images.find((i: any) => i.is_cover) || listing.listing_images[0]
        if (coverImg) coverUrl = getListingImageUrl(coverImg.storage_path)
      }
      return {
        id: listing.id,
        title: listing.title,
        district: listing.district,
        price: listing.price_monthly,
        lat: listing.lat,
        lng: listing.lng,
        coverUrl,
      }
    })

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
                  {rooms.length} alojamientos
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
                  count={allListings.filter((l) => {
                    const lUni = resolveUniversity(l.university_nearby)
                    const filterUni = resolveUniversity(item)
                    if (lUni && filterUni) return lUni.id === filterUni.id
                    return (l.university_nearby ?? '').toLowerCase().includes(item.toLowerCase())
                  }).length}
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
                  count={allListings.filter((l) => l.amenities.some((a: string) => a.toLowerCase().includes(item.toLowerCase()))).length}
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
                 {rooms.length} alojamientos encontrados
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
 
             {/* Results */}
             {rooms.length > 0 && (
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
             {allListings.length > 0 && rooms.length === 0 && (
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
             {allListings.length === 0 && (
               <div className="rounded-2xl border border-dashed border-[#D4D4D8] bg-white px-6 py-16 text-center">
                 <Sparkles className="mx-auto text-[#EAB308]" />
                 <h2 className="mt-4 text-lg font-black">Aún no hay alojamientos publicados</h2>
                 <p className="mt-2 text-sm text-[#71717A]">
                   Sé el primero en publicar un espacio para universitarios.
                 </p>
               </div>
             )}
 
             {/* Pagination — demo, se implementará con paginación real cuando haya más listings */}
             {rooms.length > 0 && (
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
         <FavoriteButton listingId={listing.id} variant="card" />
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
           {(() => {
             const uniName = resolveUniversity(listing.university_nearby)?.shortName || listing.university_nearby
             const hasUni = Boolean(uniName)
             const hasDist = Boolean(listing.distance_label)
             
             if (hasUni && hasDist) {
               return ` · ${uniName} · ${listing.distance_label}`
             } else if (hasUni) {
               return ` · Cerca de ${uniName}`
             } else if (hasDist) {
               return ` · ${listing.distance_label}`
             }
             return null
           })()}
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
