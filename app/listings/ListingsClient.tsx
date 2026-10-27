'use client'

import Link from 'next/link'
import { useMemo, useState, useEffect, useRef } from 'react'
import {
  ArrowRight,
  Check,
  ChevronDown,
  GraduationCap,
  Home as HomeIcon,
  Map,
  MapPin,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react'
import { AppHeader, Footer } from '@/components/Shared'
import HabitatMap from '@/components/HabitatMap'
import { FavoriteButton } from '@/components/FavoriteButton'
import { getListingImageUrl } from '@/lib/supabase/storage'
import { resolveUniversity } from '@/lib/universities'

// Catálogo oficial de universidades en Habitat
const universityOptions = [
  { label: 'UCSM · Católica Santa María', short: 'UCSM', value: 'UCSM' },
  { label: 'UNSA · San Agustín', short: 'UNSA', value: 'UNSA' },
  { label: 'UCSP · San Pablo', short: 'UCSP', value: 'Universidad Católica San Pablo' },
  { label: 'UTP · Tecnológica del Perú', short: 'UTP', value: 'UTP' },
]

// Tipos de alojamiento basados en datos reales
const accommodationOptions = [
  { label: 'Habitación individual', match: 'individual' },
  { label: 'Habitación compartida', match: 'compartida' },
  { label: 'Departamento / Mini depa', match: 'departamento' },
  { label: 'Casa / Residencia', match: 'casa' },
]

// Servicios principales de alta frecuencia
const mainServiceOptions = ['WiFi', 'Agua caliente', 'Cocina equipada', 'Baño privado']

// Servicios adicionales en "Más filtros" (sin duplicar los principales)
const extraFilterOptions = ['Lavandería', 'Amoblado']

// Helper de normalización para comparaciones insensibles a mayúsculas y acentos
function normalize(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export default function ListingsClient({
  initialCity = 'Arequipa',
  initialUniversity = '',
  initialMaxPrice,
  initialListings = [],
}: {
  initialCity?: string
  initialUniversity?: string
  initialMaxPrice?: number
  initialListings: any[]
}) {
  const [allListings] = useState<any[]>(initialListings)

  // Estados de filtros
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>(
    initialUniversity ? [initialUniversity] : []
  )
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [minPrice, setMinPrice] = useState<number | null>(null)
  const [maxPrice, setMaxPrice] = useState<number | null>(initialMaxPrice ?? null)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [moreFilters, setMoreFilters] = useState<string[]>([])
  const [sort, setSort] = useState('Más relevantes')

  // Control de interfaz
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list')
  const activeMenuRef = useRef<HTMLDivElement>(null)

  // Cerrar dropdown al hacer click fuera o pulsar Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (activeMenuRef.current && !activeMenuRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActiveDropdown(null)
      }
    }
    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeDropdown])

  function toggleItem(value: string, current: string[], setter: (val: string[]) => void) {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
  }

  const hasActiveFilters = Boolean(
    selectedUniversities.length > 0 ||
      selectedTypes.length > 0 ||
      minPrice !== null ||
      maxPrice !== null ||
      selectedServices.length > 0 ||
      moreFilters.length > 0
  )

  function clearAllFilters() {
    setSelectedUniversities([])
    setSelectedTypes([])
    setMinPrice(null)
    setMaxPrice(null)
    setSelectedServices([])
    setMoreFilters([])
    setActiveDropdown(null)
  }

  // Filtrado reactivo sobre datos reales
  const rooms = useMemo(() => {
    const allActiveServices = [...selectedServices, ...moreFilters]

    const filtered = allListings.filter((listing) => {
      // 1. Universidad (OR entre universidades seleccionadas)
      const matchesUniversity =
        selectedUniversities.length === 0 ||
        selectedUniversities.some((selectedUni) => {
          const targetUni = resolveUniversity(selectedUni)
          const listingUni = resolveUniversity(listing.university_nearby)
          if (targetUni && listingUni) {
            return targetUni.id === listingUni.id
          }
          return normalize(listing.university_nearby ?? '').includes(normalize(selectedUni))
        })

      // 2. Tipo de alojamiento (OR entre tipos seleccionados)
      const matchesType =
        selectedTypes.length === 0 ||
        selectedTypes.some((selectedType) => {
          const normSelected = normalize(selectedType)
          const normListingType = normalize(listing.property_type ?? '')
          if (normSelected.includes('individual')) return normListingType.includes('individual')
          if (normSelected.includes('compartida')) return normListingType.includes('compartida')
          if (normSelected.includes('departamento')) return normListingType.includes('departamento')
          if (normSelected.includes('casa') || normSelected.includes('residencia')) {
            return normListingType.includes('casa') || normListingType.includes('residencia')
          }
          return normListingType.includes(normSelected)
        })

      // 3. Rango de precio mensual (AND entre mínimo y máximo)
      const matchesMinPrice = minPrice === null || listing.price_monthly >= minPrice
      const matchesMaxPrice = maxPrice === null || listing.price_monthly <= maxPrice
      const matchesPrice = matchesMinPrice && matchesMaxPrice

      // 4. Servicios incluidos (AND entre los servicios seleccionados)
      const matchesServices =
        allActiveServices.length === 0 ||
        allActiveServices.every((srv) => {
          const normSrv = normalize(srv)
          const amenities = (listing.amenities || []).map((a: string) => normalize(a))
          if (normSrv.includes('wifi')) return amenities.some((a: string) => a.includes('wifi'))
          if (normSrv.includes('agua caliente') || normSrv.includes('agua')) {
            return amenities.some(
              (a: string) =>
                a.includes('agua caliente') || a.includes('agua incluida') || a.includes('agua')
            )
          }
          if (normSrv.includes('bano privado') || normSrv.includes('bano')) {
            return amenities.some(
              (a: string) =>
                a.includes('bano privado') || a.includes('bano propio') || a.includes('bano')
            )
          }
          if (normSrv.includes('cocina')) return amenities.some((a: string) => a.includes('cocina'))
          if (normSrv.includes('lavanderia')) return amenities.some((a: string) => a.includes('lavanderia'))
          if (normSrv.includes('amoblado')) {
            return (
              amenities.some((a: string) => a.includes('amoblado') || a.includes('amoblada')) ||
              normalize(listing.property_type ?? '').includes('amoblada')
            )
          }
          return amenities.some((a: string) => a.includes(normSrv))
        })

      return matchesUniversity && matchesType && matchesPrice && matchesServices
    })

    return [...filtered].sort((a, b) =>
      sort === 'Precio: menor a mayor'
        ? a.price_monthly - b.price_monthly
        : sort === 'Precio: mayor a menor'
          ? b.price_monthly - a.price_monthly
          : 0
    )
  }, [allListings, selectedUniversities, selectedTypes, minPrice, maxPrice, selectedServices, moreFilters, sort])

  // Datos para el mapa interactivo (solo alojamientos con coordenadas válidas)
  const mapHomes = useMemo(() => {
    return rooms
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
  }, [rooms])

  // Etiqueta legible para la universidad en el chip
  const universityChipLabel = useMemo(() => {
    if (selectedUniversities.length === 0) return 'Universidad'
    if (selectedUniversities.length === 1) {
      const u = resolveUniversity(selectedUniversities[0])
      return u?.shortName || selectedUniversities[0]
    }
    return `${selectedUniversities.length} universidades`
  }, [selectedUniversities])

  return (
    <div className="min-h-screen bg-[#FEFDF8] text-[#18181B] flex flex-col">
      <AppHeader />

      {/* ── Barra Horizontal de Filtros (INMEDIATAMENTE debajo del Header, sin huecos) ── */}
      <section className="sticky top-16 z-20 border-b border-[#E4E4E7] bg-white/95 backdrop-blur-md shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)]">
        <div className="mx-auto max-w-[1600px] w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">

              {/* 1. Universidad (Multiselect) */}
              <div className="relative" ref={activeDropdown === 'uni' ? activeMenuRef : undefined}>
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'uni' ? null : 'uni')}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold transition-all ${
                    selectedUniversities.length > 0
                      ? 'border-[#EAB308] bg-[#FEF9C3] text-[#18181B] ring-1 ring-[#EAB308]'
                      : 'border-[#E4E4E7] bg-white text-[#52525B] hover:border-[#18181B]'
                  }`}
                >
                  <GraduationCap size={14} className={selectedUniversities.length > 0 ? 'text-[#854D0E]' : 'text-[#71717A]'} />
                  <span>{universityChipLabel}</span>
                  <ChevronDown size={13} className={`transition-transform duration-200 ${activeDropdown === 'uni' ? 'rotate-180' : ''}`} />
                </button>

                {activeDropdown === 'uni' && (
                  <div className="absolute left-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-[#E4E4E7] bg-white p-3 shadow-xl z-50">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#71717A]">
                        Universidades
                      </p>
                      {selectedUniversities.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedUniversities([])}
                          className="text-[11px] font-bold text-[#71717A] hover:text-[#18181B]"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>
                    <div className="space-y-1">
                      {universityOptions.map((u) => {
                        const isChecked = selectedUniversities.includes(u.value)
                        return (
                          <label
                            key={u.value}
                            className={`flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-bold cursor-pointer transition-colors ${
                              isChecked ? 'bg-[#FEF9C3] text-[#854D0E]' : 'hover:bg-zinc-100 text-[#18181B]'
                            }`}
                          >
                            <span>{u.label}</span>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleItem(u.value, selectedUniversities, setSelectedUniversities)}
                              className="size-4 rounded border-[#D4D4D8] accent-[#FACC15]"
                            />
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Tipo de Alojamiento (Multiselect) */}
              <div className="relative" ref={activeDropdown === 'type' ? activeMenuRef : undefined}>
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold transition-all ${
                    selectedTypes.length > 0
                      ? 'border-[#EAB308] bg-[#FEF9C3] text-[#18181B] ring-1 ring-[#EAB308]'
                      : 'border-[#E4E4E7] bg-white text-[#52525B] hover:border-[#18181B]'
                  }`}
                >
                  <HomeIcon size={14} className={selectedTypes.length > 0 ? 'text-[#854D0E]' : 'text-[#71717A]'} />
                  <span>
                    {selectedTypes.length === 0
                      ? 'Tipo de espacio'
                      : selectedTypes.length === 1
                        ? selectedTypes[0]
                        : `${selectedTypes.length} tipos`}
                  </span>
                  <ChevronDown size={13} className={`transition-transform duration-200 ${activeDropdown === 'type' ? 'rotate-180' : ''}`} />
                </button>

                {activeDropdown === 'type' && (
                  <div className="absolute left-0 top-full mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-[#E4E4E7] bg-white p-3 shadow-xl z-50">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#71717A]">
                        Tipo de alojamiento
                      </p>
                      {selectedTypes.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedTypes([])}
                          className="text-[11px] font-bold text-[#71717A] hover:text-[#18181B]"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>
                    <div className="space-y-1">
                      {accommodationOptions.map((opt) => {
                        const isChecked = selectedTypes.includes(opt.label)
                        return (
                          <label
                            key={opt.label}
                            className={`flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-bold cursor-pointer transition-colors ${
                              isChecked ? 'bg-[#FEF9C3] text-[#854D0E]' : 'hover:bg-zinc-100 text-[#18181B]'
                            }`}
                          >
                            <span>{opt.label}</span>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleItem(opt.label, selectedTypes, setSelectedTypes)}
                              className="size-4 rounded border-[#D4D4D8] accent-[#FACC15]"
                            />
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Rango de Precio (Mínimo y Máximo) */}
              <div className="relative" ref={activeDropdown === 'price' ? activeMenuRef : undefined}>
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'price' ? null : 'price')}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold transition-all ${
                    minPrice !== null || maxPrice !== null
                      ? 'border-[#EAB308] bg-[#FEF9C3] text-[#18181B] ring-1 ring-[#EAB308]'
                      : 'border-[#E4E4E7] bg-white text-[#52525B] hover:border-[#18181B]'
                  }`}
                >
                  <span>
                    {minPrice !== null && maxPrice !== null
                      ? `S/ ${minPrice} - S/ ${maxPrice}`
                      : maxPrice !== null
                        ? `Hasta S/ ${maxPrice}`
                        : minPrice !== null
                          ? `Desde S/ ${minPrice}`
                          : 'Precio mensual'}
                  </span>
                  <ChevronDown size={13} className={`transition-transform duration-200 ${activeDropdown === 'price' ? 'rotate-180' : ''}`} />
                </button>

                {activeDropdown === 'price' && (
                  <div className="absolute left-0 sm:left-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-[#E4E4E7] bg-white p-4 shadow-xl z-50">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#71717A]">
                        Rango de precio mensual (S/)
                      </p>
                      {(minPrice !== null || maxPrice !== null) && (
                        <button
                          type="button"
                          onClick={() => {
                            setMinPrice(null)
                            setMaxPrice(null)
                          }}
                          className="text-[11px] font-bold text-[#71717A] hover:text-[#18181B]"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <label className="text-[10px] font-bold text-[#71717A] block mb-1">MÍNIMO</label>
                        <div className="flex items-center rounded-xl border border-[#D4D4D8] px-3 py-2 focus-within:border-[#18181B]">
                          <span className="text-xs text-[#71717A] mr-1">S/</span>
                          <input
                            type="number"
                            placeholder="0"
                            min="0"
                            value={minPrice ?? ''}
                            onChange={(e) => {
                              const val = e.target.value ? parseInt(e.target.value, 10) : null
                              setMinPrice(val && val >= 0 ? val : null)
                            }}
                            className="w-full text-xs font-bold text-[#18181B] outline-none bg-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#71717A] block mb-1">MÁXIMO</label>
                        <div className="flex items-center rounded-xl border border-[#D4D4D8] px-3 py-2 focus-within:border-[#18181B]">
                          <span className="text-xs text-[#71717A] mr-1">S/</span>
                          <input
                            type="number"
                            placeholder="Sin límite"
                            min="0"
                            value={maxPrice ?? ''}
                            onChange={(e) => {
                              const val = e.target.value ? parseInt(e.target.value, 10) : null
                              setMaxPrice(val && val > 0 ? val : null)
                            }}
                            className="w-full text-xs font-bold text-[#18181B] outline-none bg-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#F0F0F1]">
                      <p className="text-[10px] font-bold text-[#71717A] mb-2 uppercase tracking-wider">Accesos directos</p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: 'Hasta S/ 600', min: null, max: 600 },
                          { label: 'Hasta S/ 800', min: null, max: 800 },
                          { label: 'Hasta S/ 1,200', min: null, max: 1200 },
                          { label: 'S/ 500 - S/ 1,000', min: 500, max: 1000 },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => {
                              setMinPrice(preset.min)
                              setMaxPrice(preset.max)
                            }}
                            className="rounded-lg bg-[#F4F2EB] px-2.5 py-1 text-[11px] font-bold text-[#52525B] hover:bg-[#E4E4E7] transition-colors"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Servicios Incluidos (Frecuentes) */}
              <div className="relative" ref={activeDropdown === 'services' ? activeMenuRef : undefined}>
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'services' ? null : 'services')}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold transition-all ${
                    selectedServices.length > 0
                      ? 'border-[#EAB308] bg-[#FEF9C3] text-[#18181B] ring-1 ring-[#EAB308]'
                      : 'border-[#E4E4E7] bg-white text-[#52525B] hover:border-[#18181B]'
                  }`}
                >
                  <span>
                    {selectedServices.length === 0
                      ? 'Servicios'
                      : `${selectedServices.length} servicios`}
                  </span>
                  <ChevronDown size={13} className={`transition-transform duration-200 ${activeDropdown === 'services' ? 'rotate-180' : ''}`} />
                </button>

                {activeDropdown === 'services' && (
                  <div className="absolute left-0 sm:left-0 top-full mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-[#E4E4E7] bg-white p-3 shadow-xl z-50">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#71717A]">
                        Servicios incluidos
                      </p>
                      {selectedServices.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedServices([])}
                          className="text-[11px] font-bold text-[#71717A] hover:text-[#18181B]"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>
                    <div className="space-y-1">
                      {mainServiceOptions.map((item) => {
                        const isChecked = selectedServices.includes(item)
                        return (
                          <label
                            key={item}
                            className={`flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-bold cursor-pointer transition-colors ${
                              isChecked ? 'bg-[#FEF9C3] text-[#854D0E]' : 'hover:bg-zinc-100 text-[#18181B]'
                            }`}
                          >
                            <span>{item}</span>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleItem(item, selectedServices, setSelectedServices)}
                              className="size-4 rounded border-[#D4D4D8] accent-[#FACC15]"
                            />
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Más Filtros (Sin duplicar opciones) */}
              <div className="relative" ref={activeDropdown === 'more' ? activeMenuRef : undefined}>
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === 'more' ? null : 'more')}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold transition-all ${
                    moreFilters.length > 0
                      ? 'border-[#EAB308] bg-[#FEF9C3] text-[#18181B] ring-1 ring-[#EAB308]'
                      : 'border-[#E4E4E7] bg-white text-[#52525B] hover:border-[#18181B]'
                  }`}
                >
                  <SlidersHorizontal size={13} className={moreFilters.length > 0 ? 'text-[#854D0E]' : 'text-[#71717A]'} />
                  <span>{moreFilters.length > 0 ? `Más (${moreFilters.length})` : 'Más filtros'}</span>
                  <ChevronDown size={13} className={`transition-transform duration-200 ${activeDropdown === 'more' ? 'rotate-180' : ''}`} />
                </button>

                {activeDropdown === 'more' && (
                  <div className="absolute right-0 sm:left-0 sm:right-auto top-full mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-[#E4E4E7] bg-white p-3 shadow-xl z-50">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#71717A]">
                        Filtros adicionales
                      </p>
                      {moreFilters.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setMoreFilters([])}
                          className="text-[11px] font-bold text-[#71717A] hover:text-[#18181B]"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>
                    <div className="space-y-1">
                      {extraFilterOptions.map((item) => {
                        const isChecked = moreFilters.includes(item)
                        return (
                          <label
                            key={item}
                            className={`flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-bold cursor-pointer transition-colors ${
                              isChecked ? 'bg-[#FEF9C3] text-[#854D0E]' : 'hover:bg-zinc-100 text-[#18181B]'
                            }`}
                          >
                            <span>{item}</span>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleItem(item, moreFilters, setMoreFilters)}
                              className="size-4 rounded border-[#D4D4D8] accent-[#FACC15]"
                            />
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Limpiar Filtros */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-1 rounded-full bg-zinc-100 hover:bg-zinc-200 px-3 py-2 text-xs font-bold text-[#71717A] hover:text-[#18181B] transition-colors"
                >
                  <RotateCcw size={12} />
                  <span>Limpiar todo</span>
                </button>
              )}
            </div>

            {/* Ordenación (Desktop) */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-[#71717A] shrink-0">
              <span className="hidden md:inline">Ordenar:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-xl border border-[#E4E4E7] bg-white px-3 py-1.5 text-xs font-bold text-[#18181B] outline-none focus:border-[#18181B] cursor-pointer"
              >
                <option>Más relevantes</option>
                <option>Precio: menor a mayor</option>
                <option>Precio: mayor a menor</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contenido Principal (Split 58% Lista / 42% Mapa) ── */}
      <main className="mx-auto max-w-[1600px] w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-6 flex-1 flex flex-col">

        {/* Encabezado contextual */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#F0F0F1]">
          <div>
            <nav className="mb-1 flex items-center gap-2 text-xs font-semibold text-[#71717A]">
              <Link href="/" className="hover:text-[#18181B] transition-colors">Inicio</Link>
              <span>/</span>
              <span className="text-[#18181B]">Resultados</span>
            </nav>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#18181B]">
              Alojamientos cerca de {selectedUniversities.length === 1 ? universityChipLabel : selectedUniversities.length > 1 ? `${selectedUniversities.length} universidades` : 'tu universidad'}
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-[#71717A]">
              <strong className="text-[#18181B] font-bold">{rooms.length} {rooms.length === 1 ? 'alojamiento encontrado' : 'alojamientos encontrados'}</strong> en {initialCity}
            </p>
          </div>

          {/* Selector de orden móvil y toggle Lista/Mapa */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="sm:hidden">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-xl border border-[#E4E4E7] bg-white px-2.5 py-1.5 text-xs font-bold text-[#18181B]"
              >
                <option>Más relevantes</option>
                <option>Precio: menor a mayor</option>
                <option>Precio: mayor a menor</option>
              </select>
            </div>

            {/* Alternador Móvil Lista / Mapa */}
            <div className="flex lg:hidden items-center rounded-xl border border-[#E4E4E7] bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setMobileView('list')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  mobileView === 'list' ? 'bg-[#FACC15] text-[#18181B]' : 'text-[#71717A] hover:text-[#18181B]'
                }`}
              >
                Lista ({rooms.length})
              </button>
              <button
                type="button"
                onClick={() => setMobileView('map')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  mobileView === 'map' ? 'bg-[#FACC15] text-[#18181B]' : 'text-[#71717A] hover:text-[#18181B]'
                }`}
              >
                <Map size={13} /> Mapa
              </button>
            </div>
          </div>
        </div>

        {/* Layout dividido */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start flex-1">

          {/* Columna Izquierda: Resultados */}
          <section className={`lg:col-span-7 xl:col-span-7 flex flex-col ${mobileView === 'map' ? 'hidden lg:flex' : 'flex'}`}>
            {rooms.length > 0 ? (
              <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
                {rooms.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[#D4D4D8] bg-white p-10 sm:p-14 text-center my-4">
                <Sparkles className="mx-auto text-[#EAB308]" size={36} />
                <h2 className="mt-4 text-lg font-black text-[#18181B]">
                  No encontramos alojamientos con estos filtros
                </h2>
                <p className="mt-2 text-sm text-[#71717A] max-w-sm mx-auto">
                  Prueba ampliando el rango de precio o desmarcando filtros específicos para ver más opciones disponibles en Arequipa.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] px-5 py-2.5 text-sm font-black text-[#18181B] transition-colors"
                >
                  <RotateCcw size={15} /> Limpiar todos los filtros
                </button>
              </div>
            )}
          </section>

          {/* Columna Derecha: Mapa Interactivo Sticky */}
          <section className={`lg:col-span-5 xl:col-span-5 lg:sticky lg:top-36 ${mobileView === 'list' ? 'hidden lg:block' : 'block'}`}>
            <div className="w-full rounded-3xl overflow-hidden border border-[#E4E4E7] shadow-sm bg-[#F4F2EB]">
              <HabitatMap
                homes={mapHomes}
                className="h-[calc(100vh-170px)] min-h-[500px] max-h-[820px] w-full"
              />
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  )
}

function ListingCard({ listing }: { listing: any }) {
  let coverUrl = null
  if (listing.listing_images && listing.listing_images.length > 0) {
    const coverImg = listing.listing_images.find((i: any) => i.is_cover) || listing.listing_images[0]
    if (coverImg) coverUrl = getListingImageUrl(coverImg.storage_path)
  }

  const uniName = resolveUniversity(listing.university_nearby)?.shortName || listing.university_nearby

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative h-48 overflow-hidden bg-[#E4E4E7]">
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
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#047857]/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-black text-white shadow-sm">
            <Check size={12} /> Verificado
          </span>
        )}

        <FavoriteButton listingId={listing.id} variant="card" />
      </div>

      <div className="flex flex-1 flex-col p-4 justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-sm font-black leading-snug text-[#18181B]">
              {listing.title}
            </h3>
            <p className="shrink-0 text-right text-base font-black text-[#18181B]">
              S/ {listing.price_monthly.toFixed(0)}
              <span className="block text-[10px] font-medium text-[#71717A]">/mes</span>
            </p>
          </div>

          <p className="mt-1 text-xs font-medium text-[#71717A]">
            {listing.district}
            {uniName && listing.distance_label ? (
              <span> · {uniName} · {listing.distance_label}</span>
            ) : uniName ? (
              <span> · Cerca de {uniName}</span>
            ) : listing.distance_label ? (
              <span> · {listing.distance_label}</span>
            ) : null}
          </p>

          {listing.amenities && listing.amenities.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {listing.amenities.slice(0, 3).map((item: string) => (
                <span
                  key={item}
                  className="rounded-lg bg-[#F4F2EB] px-2 py-0.5 text-[10px] font-bold text-[#52525B]"
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>

        <Link
          href={`/alojamiento/${listing.id}`}
          className="mt-4 flex items-center justify-end gap-1 border-t border-[#F0F0F1] pt-3 text-xs font-black text-[#18181B] hover:text-[#A16207] transition-colors"
        >
          Ver detalles <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  )
}
