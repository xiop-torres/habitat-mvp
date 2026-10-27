'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect, type FormEvent } from 'react'
import HeroMap from '@/components/HeroMap'
import {
  ArrowRight,
  Menu,
  Search,
  ShieldCheck,
  X,
  MapPin,
  Heart,
  MessageCircle,
  Home as HomeIcon,
  Bed,
  Wifi,
  ChefHat,
  Bath,
  GraduationCap,
  ChevronDown,
  Users,
} from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { Button, PrimaryButton } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ─── Data ────────────────────────────────────────────────────────────────────

const campuses = [
  {
    name: 'UNSA',
    subtitle: 'Ingenierías & Sociales',
    image: '/unsa.jpg',
    href: '/buscar?universidad=UNSA',
  },
  {
    name: 'UCSM',
    subtitle: 'Católica Santa María',
    image: '/ucsm.jpg',
    href: '/buscar?universidad=UCSM',
  },
  {
    name: 'UCSP',
    subtitle: 'Universidad San Pablo',
    image: '/ucsp.jpg',
    href: '/buscar?universidad=Universidad%20Cat%C3%B3lica%20San%20Pablo',
  },
  {
    name: 'UTP',
    subtitle: 'Tecnológica del Perú',
    image: '/utp.png',
    href: '/buscar?universidad=UTP',
  },
]

const mockListings = [
  {
    id: 'demo-1',
    title: 'Habitación amoblada',
    district: 'Yanahuara, Arequipa',
    price: 580,
    badge: 'A 8 min de UCSM',
    amenities: ['1 hab.', 'WiFi', 'Servicios'],
    image: '/habitat-hero.png',
  },
  {
    id: 'demo-2',
    title: 'Departamento compartido',
    district: 'Cercado, Arequipa',
    price: 750,
    badge: 'A 13 min de UNSA',
    amenities: ['3 hab.', 'WiFi', 'Cocina'],
    image: '/pasos-alquiler-seccion.jpg',
  },
  {
    id: 'demo-3',
    title: 'Habitación con baño propio',
    district: 'Cayma, Arequipa',
    price: 650,
    badge: 'A 10 min de UCSP',
    amenities: ['1 hab.', 'WiFi', 'Baño privado'],
    image: '/habitat-room.png',
  },
]

const amenityIcon = (text: string) => {
  if (text.includes('hab')) return <Bed size={13} />
  if (text.toLowerCase().includes('wifi')) return <Wifi size={13} />
  if (text.includes('Cocina')) return <ChefHat size={13} />
  if (text.includes('Baño') || text.includes('baño')) return <Bath size={13} />
  return null
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function HomePageClient({ initialListings = [] }: { initialListings?: any[] }) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [city, setCity] = useState('Arequipa')
  const [university, setUniversity] = useState('')
  const [price, setPrice] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Detect mobile once on mount — avoids SSR mismatch
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Detect scroll to toggle dynamic navbar style smoothly
  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 40)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function handleSearch(event: FormEvent) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (city) params.set('ciudad', city)
    if (university) params.set('universidad', university)
    if (price && Number(price) > 0) params.set('precio_maximo', price)
    const query = params.toString() ? `?${params.toString()}` : ''
    router.push(`/buscar${query}`)
  }

  const validListingCount = initialListings.filter((l) => l.lat != null && l.lng != null).length

  return (
    <div className="min-h-screen bg-[#FEFDF8] text-[#18181B] flex flex-col">

      {/* ── Navbar Dinámico con transición al hacer scroll ── */}
      <header
        className={cn(
          'sticky top-0 z-40 transition-all duration-300',
          isScrolled
            ? 'bg-[#FACC15] border-b border-[#EAB308] shadow-[0_4px_20px_rgba(234,179,8,0.22)]'
            : 'bg-[#FEFDF8]/95 backdrop-blur-md border-b border-[#E4E4E7] shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1600px] w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 xl:px-10">
          <BrandLogo
            compact
            variant={isScrolled ? 'white' : 'default'}
            className={cn('transition-all duration-300', isScrolled ? 'drop-shadow-sm' : '')}
          />
          
          <nav className="hidden items-center gap-7 text-sm font-bold lg:flex">
            <Link
              href="/buscar"
              className={cn(
                'transition-colors duration-300',
                isScrolled ? 'text-[#18181B] hover:text-black/70' : 'text-[#71717A] hover:text-[#18181B]'
              )}
            >
              Buscar
            </Link>
            <Link
              href="#universidades"
              className={cn(
                'transition-colors duration-300',
                isScrolled ? 'text-[#18181B] hover:text-black/70' : 'text-[#71717A] hover:text-[#18181B]'
              )}
            >
              Universidades
            </Link>
            <Link
              href="#como-funciona"
              className={cn(
                'transition-colors duration-300',
                isScrolled ? 'text-[#18181B] hover:text-black/70' : 'text-[#71717A] hover:text-[#18181B]'
              )}
            >
              Cómo funciona
            </Link>
            <Link
              href="/propietario"
              className={cn(
                'transition-colors duration-300',
                isScrolled ? 'text-[#18181B] hover:text-black/70' : 'text-[#71717A] hover:text-[#18181B]'
              )}
            >
              Para propietarios
            </Link>
            <Link
              href="/favoritos"
              className={cn(
                'inline-flex items-center gap-1.5 transition-colors duration-300',
                isScrolled ? 'text-[#18181B] hover:text-black/70' : 'text-[#71717A] hover:text-[#18181B]'
              )}
            >
              <Heart size={15} /> Favoritos
            </Link>
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <Link
              href="/login"
              className={cn(
                'px-3.5 py-2 text-sm font-bold transition-colors duration-300',
                isScrolled ? 'text-[#18181B] hover:text-black/70' : 'text-[#18181B] hover:text-[#71717A]'
              )}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro/propietario"
              className={cn(
                'inline-flex h-10 items-center justify-center rounded-xl px-4.5 text-sm font-black shadow-sm transition-all duration-300 active:scale-95',
                isScrolled
                  ? 'bg-[#18181B] text-white hover:bg-black hover:shadow-md'
                  : 'bg-[#FACC15] text-[#18181B] hover:bg-[#EAB308]'
              )}
            >
              Publicar alojamiento
            </Link>
          </div>

          <button
            type="button"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenuOpen(!menuOpen)}
            className={cn(
              'grid size-10 place-items-center rounded-xl border transition-all duration-300 lg:hidden',
              isScrolled
                ? 'border-[#18181B]/20 bg-[#18181B] text-white hover:bg-black'
                : 'border-[#E4E4E7] bg-white text-[#18181B] hover:bg-zinc-50'
            )}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Menú móvil desplegable */}
        {menuOpen && (
          <div
            className={cn(
              'border-t px-5 py-4 lg:hidden animate-in fade-in slide-in-from-top-2 transition-colors duration-300',
              isScrolled
                ? 'border-[#EAB308] bg-[#FACC15] text-[#18181B]'
                : 'border-[#E4E4E7] bg-[#FEFDF8] text-[#18181B]'
            )}
          >
            <nav className="grid gap-3 text-sm font-bold">
              <Link href="/buscar" onClick={() => setMenuOpen(false)} className="py-1">Buscar</Link>
              <Link href="#universidades" onClick={() => setMenuOpen(false)} className="py-1">Universidades</Link>
              <Link href="#como-funciona" onClick={() => setMenuOpen(false)} className="py-1">Cómo funciona</Link>
              <Link href="/propietario" onClick={() => setMenuOpen(false)} className="py-1">Para propietarios</Link>
              <Link href="/favoritos" onClick={() => setMenuOpen(false)} className="py-1 flex items-center gap-2">
                <Heart size={15} /> Favoritos
              </Link>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className={cn('py-1 border-t pt-2', isScrolled ? 'border-[#EAB308]' : 'border-[#E4E4E7]')}
              >
                Iniciar sesión
              </Link>
            </nav>
            <Link
              href="/registro/propietario"
              onClick={() => setMenuOpen(false)}
              className={cn(
                'mt-4 inline-flex w-full justify-center rounded-xl px-4 py-3 text-sm font-black shadow-sm transition-colors duration-300',
                isScrolled ? 'bg-[#18181B] text-white hover:bg-black' : 'bg-[#FACC15] text-[#18181B] hover:bg-[#EAB308]'
              )}
            >
              Publicar alojamiento
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col">

        {/* ── Hero Principal (Mapa a Pantalla Completa: calc(100dvh - 4rem)) ── */}
        <section className="relative w-full h-[calc(100dvh-4rem)] min-h-[580px] max-h-[920px] overflow-hidden flex flex-col justify-between">
          
          {/* Mapa de fondo 100% interactivo */}
          <div className="absolute inset-0 z-0">
            <HeroMap
              listings={initialListings}
              selectedUni={university}
              onUniSelect={(v) => setUniversity(v)}
              isMobile={isMobile}
            />
            {/* Gradiente sutil superior para legibilidad óptima de textos */}
            <div className="absolute inset-x-0 top-0 h-80 sm:h-96 bg-gradient-to-b from-[#FEFDF8]/90 via-[#FEFDF8]/35 to-transparent pointer-events-none" />
          </div>

          {/* Bloque central superpuesto flotante */}
          <div className="relative z-10 w-full max-w-[1040px] mx-auto px-4 sm:px-6 pt-6 sm:pt-10 flex flex-col items-center text-center pointer-events-none">
            <div className="pointer-events-auto flex flex-col items-center w-full">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E4E7] bg-white/95 backdrop-blur-sm px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-[#18181B] shadow-sm mb-3 sm:mb-4">
                <MapPin size={13} className="text-[#EAB308]" /> CERCA DE TU UNIVERSIDAD
              </div>

              {/* Título */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-extrabold tracking-tight text-[#18181B] leading-[1.08] max-w-2xl">
                Encuentra tu lugar ideal<br />
                en <span className="text-[#EAB308]">Arequipa</span>
              </h1>

              {/* Subtítulo */}
              <p className="mt-3 max-w-xl text-xs sm:text-sm md:text-[15px] leading-relaxed text-[#52525B]">
                Habitaciones, viviendas y departamentos pensados para estudiantes,<br className="hidden sm:inline" />
                con información clara y a pocos minutos de tu campus.
              </p>

              {/* Buscador Funcional Tipo Cápsula Flotante */}
              <form
                onSubmit={handleSearch}
                className="mt-6 sm:mt-8 w-full max-w-[960px] rounded-[24px] border border-[#E4E4E7] bg-white shadow-[0_12px_36px_rgba(24,24,27,0.12)] p-2 transition-all hover:shadow-[0_16px_44px_rgba(24,24,27,0.16)]"
              >
                <div className="flex flex-col sm:flex-row items-stretch divide-y sm:divide-y-0 sm:divide-x divide-[#E4E4E7] gap-0">
                  
                  {/* Ciudad */}
                  <div className="flex flex-1 items-center gap-2.5 px-4 py-2.5 sm:py-2">
                    <MapPin size={18} className="text-[#EAB308] shrink-0" />
                    <div className="flex flex-col text-left min-w-0">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#71717A]">CIUDAD</span>
                      <span className="text-sm font-bold text-[#18181B]">Arequipa</span>
                    </div>
                  </div>

                  {/* Universidad */}
                  <label className="flex flex-[1.4] items-center gap-2.5 px-4 py-2.5 sm:py-2 hover:bg-zinc-50 rounded-xl transition-colors cursor-pointer group">
                    <GraduationCap size={18} className="text-[#EAB308] shrink-0 group-hover:text-[#18181B] transition-colors" />
                    <div className="flex flex-col text-left flex-1 min-w-0">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#71717A]">UNIVERSIDAD</span>
                      <select
                        aria-label="Universidad"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        className="w-full bg-transparent text-sm font-bold text-[#18181B] outline-none border-0 p-0 cursor-pointer appearance-none truncate"
                      >
                        <option value="">Todas las universidades</option>
                        <option value="UNSA">UNSA · San Agustín</option>
                        <option value="UCSM">UCSM · Santa María</option>
                        <option value="Universidad Católica San Pablo">UCSP · San Pablo</option>
                        <option value="UTP">UTP · Tecnológica del Perú</option>
                      </select>
                    </div>
                    <ChevronDown size={14} className="text-[#71717A] shrink-0" />
                  </label>

                  {/* Precio Máximo */}
                  <label className="flex flex-1 items-center gap-2.5 px-4 py-2.5 sm:py-2 hover:bg-zinc-50 rounded-xl transition-colors cursor-pointer group">
                    <span className="font-extrabold text-[#EAB308] text-sm shrink-0">S/</span>
                    <div className="flex flex-col text-left flex-1 min-w-0">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#71717A]">MÁX. PRECIO</span>
                      <select
                        aria-label="Precio máximo mensual"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-transparent text-sm font-bold text-[#18181B] outline-none border-0 p-0 cursor-pointer appearance-none truncate"
                      >
                        <option value="">Cualquier precio</option>
                        <option value="500">Hasta S/ 500</option>
                        <option value="700">Hasta S/ 700</option>
                        <option value="900">Hasta S/ 900</option>
                        <option value="1200">Hasta S/ 1,200</option>
                        <option value="1500">Hasta S/ 1,500</option>
                        <option value="2000">Hasta S/ 2,000</option>
                      </select>
                    </div>
                    <ChevronDown size={14} className="text-[#71717A] shrink-0" />
                  </label>

                  {/* Botón Buscar */}
                  <div className="p-1 sm:p-0 sm:pl-2 shrink-0 flex items-center">
                    <button
                      type="submit"
                      className="h-11 sm:h-12 w-full sm:w-auto px-6 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#18181B] font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                    >
                      <Search size={16} />
                      <span>Buscar alojamientos</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Píldoras flotantes inferiores sobre el mapa */}
          <div className="relative z-10 w-full px-5 pb-5 flex items-center justify-between gap-3 pointer-events-none">
            {/* Píldora izquierda: Conteo de alojamientos */}
            <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-[#E4E4E7] bg-white/95 backdrop-blur-sm px-3.5 py-1.5 text-xs font-bold text-[#18181B] shadow-md ml-14 sm:ml-16">
              <span className="size-2.5 rounded-full bg-[#FACC15] shadow-sm" />
              <span>
                {validListingCount > 0
                  ? `${validListingCount} ${validListingCount === 1 ? 'alojamiento en el mapa' : 'alojamientos en el mapa'}`
                  : 'Explora alojamientos en el mapa'}
              </span>
            </div>

            {/* Píldora derecha: Leyenda */}
            <div className="pointer-events-auto hidden sm:inline-flex items-center gap-3 rounded-full border border-[#E4E4E7] bg-white/95 backdrop-blur-sm px-4 py-1.5 text-xs font-bold text-[#52525B] shadow-md">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#FACC15]" /> Alojamientos
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#18181B]" /> Universidades
              </span>
            </div>
          </div>
        </section>

        {/* ── Universidades ── */}
        <section id="universidades" className="bg-[#FEFDF8] py-20 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="mx-auto max-w-[1600px] w-full">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-10 sm:mb-12">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#EAB308] mb-2">Cerca de tu universidad</p>
                <h2 className="text-[28px] sm:text-[34px] lg:text-[38px] font-extrabold text-[#18181B] leading-tight">
                  Explora alojamientos por universidad
                </h2>
              </div>
              <Link href="/buscar" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#18181B] hover:text-[#EAB308] transition whitespace-nowrap mt-2 sm:mt-0">
                Ver todas las universidades <ArrowRight size={15} />
              </Link>
            </div>

            {/* Campus grid — scrollable on mobile */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {campuses.map((campus) => (
                <Link
                  key={campus.name}
                  href={campus.href}
                  className="group relative overflow-hidden rounded-[20px] shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4]"
                >
                  <Image
                    src={campus.image}
                    alt={campus.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#18181B]/90 via-[#18181B]/20 to-transparent" />
                  <div className="relative z-10 flex h-full flex-col justify-end p-4 sm:p-5 text-white">
                    <h3 className="text-[22px] sm:text-[26px] font-extrabold leading-none mb-0.5">{campus.name}</h3>
                    <p className="text-xs text-zinc-300 mb-4 sm:mb-5">{campus.subtitle}</p>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#FACC15] px-3 py-1.5 text-[12px] font-extrabold text-[#18181B] w-fit transition group-hover:bg-[#EAB308]">
                      Ver alojamientos <ArrowRight size={13} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Alojamientos destacados ── */}
        <section className="bg-white border-y border-[#E4E4E7] py-20 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="mx-auto max-w-[1600px] w-full">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-10 sm:mb-12">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#EAB308] mb-2">Alojamientos destacados</p>
                <h2 className="text-[28px] sm:text-[34px] lg:text-[38px] font-extrabold text-[#18181B] leading-tight">
                  Opciones que podrían gustarte
                </h2>
              </div>
              <Link href="/buscar" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#18181B] hover:text-[#EAB308] transition whitespace-nowrap mt-2 sm:mt-0">
                Ver más alojamientos <ArrowRight size={15} />
              </Link>
            </div>

            <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {mockListings.map((listing) => (
                <Link
                  key={listing.id}
                  href="/buscar"
                  className="group block overflow-hidden rounded-[20px] border border-[#E4E4E7] bg-white shadow-sm transition hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="relative w-full aspect-[4/3] bg-zinc-100">
                    <Image
                      src={listing.image}
                      alt={listing.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute top-3 left-3 bg-[#FACC15] text-[#18181B] text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-sm">
                      {listing.badge}
                    </div>
                    <button className="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-white/90 text-zinc-400 hover:text-red-500 shadow-sm transition">
                      <Heart size={15} />
                    </button>
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className="font-extrabold text-[17px] text-[#18181B]">{listing.title}</h3>
                    <div className="flex items-center gap-1 mt-1 text-[13px] text-[#71717A]">
                      <MapPin size={12} />
                      <span>{listing.district}</span>
                    </div>
                    <p className="mt-2 text-[20px] font-extrabold text-[#18181B]">
                      S/ {listing.price} <span className="text-sm font-normal text-[#71717A]">/ mes</span>
                    </p>
                    <div className="mt-3 pt-3 border-t border-[#E4E4E7] flex items-center gap-4 text-[12px] text-[#71717A] font-semibold">
                      {listing.amenities.map((a) => (
                        <span key={a} className="inline-flex items-center gap-1">
                          {amenityIcon(a)} {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Cómo funciona ── */}
        <section id="como-funciona" className="bg-[#FEFDF8] py-20 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="mx-auto max-w-[1600px] w-full">
            <div className="grid gap-14 lg:gap-20 lg:grid-cols-2 lg:items-center">
              {/* Left: steps */}
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#EAB308] mb-3">Fácil y rápido</p>
                <h2 className="text-[28px] sm:text-[34px] lg:text-[40px] font-extrabold text-[#18181B] leading-tight mb-10 sm:mb-12">
                  Cómo encontrar<br />
                  tu <span className="underline decoration-[#FACC15] decoration-4 underline-offset-4">alojamiento</span>
                </h2>

                <div className="space-y-8 sm:space-y-10">
                  {[
                    {
                      icon: <GraduationCap size={22} className="text-[#18181B]" />,
                      title: 'Busca cerca de tu campus',
                      text: 'Filtra por universidad, precio y servicios.',
                    },
                    {
                      icon: <MapPin size={22} className="text-[#18181B]" />,
                      title: 'Conoce el alojamiento',
                      text: 'Revisa fotos, distancia, servicios y disponibilidad.',
                    },
                    {
                      icon: <MessageCircle size={22} className="text-[#18181B]" />,
                      title: 'Coordina una visita',
                      text: 'Escribe al propietario y agenda la visita ideal.',
                    },
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-5">
                      <div className="shrink-0 grid size-12 place-items-center rounded-2xl bg-[#FACC15]/20 border border-[#FACC15]/30">
                        {step.icon}
                      </div>
                      <div>
                        <h3 className="text-[17px] sm:text-[19px] font-extrabold text-[#18181B] leading-snug">{step.title}</h3>
                        <p className="mt-1 text-[14px] sm:text-[15px] text-[#71717A] leading-relaxed">{step.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: image */}
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-[24px] overflow-hidden shadow-2xl">
                <Image
                  src="/pasos-alquiler-seccion.jpg"
                  alt="Habitación de alojamiento universitario"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {/* Floating badge */}
                <div className="absolute bottom-5 right-5 bg-white rounded-[16px] shadow-lg px-4 py-3 flex items-center gap-3 max-w-[200px]">
                  <span className="grid size-9 place-items-center rounded-full bg-[#FACC15]/20 shrink-0">
                    <HomeIcon size={18} className="text-[#18181B]" />
                  </span>
                  <p className="text-[12px] font-extrabold text-[#18181B] leading-tight">Vive más cerca<br />de lo que te gusta</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Beneficios ── */}
        <section className="bg-white border-y border-[#E4E4E7] py-14 sm:py-16 px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="mx-auto max-w-[1600px] w-full">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-6 lg:divide-x divide-[#E4E4E7]">
              {[
                { title: 'Verificación simple', text: 'Publicaciones más seguras', icon: ShieldCheck },
                { title: 'Cerca a tu facultad', text: 'Ubicaciones estratégicas', icon: MapPin },
                { title: 'Contacto directo', text: 'Habla con propietarios', icon: MessageCircle },
                { title: 'Sin comisiones', text: 'Publicación gratuita', icon: HomeIcon },
              ].map((b, idx) => (
                <div key={idx} className={cn('flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-3 sm:gap-4', idx > 0 && 'lg:pl-6')}>
                  <div className="grid size-11 shrink-0 place-items-center rounded-full bg-[#FEF9C3] text-[#A16207]">
                    <b.icon size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[14px] sm:text-[15px] text-[#18181B]">{b.title}</h4>
                    <p className="mt-0.5 text-[12px] sm:text-[13px] text-[#71717A]">{b.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Propietarios (Diseño fiel a imagen de inspiración) ── */}
        <section className="py-20 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="mx-auto max-w-[1600px] w-full">
            <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-[#111113] shadow-2xl border border-white/5">
              
              {/* Acento curvo amarillo en esquina inferior izquierda */}
              <svg
                className="absolute bottom-0 left-0 w-28 h-28 sm:w-44 sm:h-44 text-[#FACC15] pointer-events-none z-0 select-none"
                viewBox="0 0 160 160"
                fill="none"
              >
                <path d="M0 160 L0 60 Q40 100 130 160 Z" fill="currentColor" />
              </svg>

              <div className="relative z-10 grid lg:grid-cols-12 items-stretch gap-0">
                {/* Columna Izquierda: Contenido y Acciones */}
                <div className="lg:col-span-7 flex flex-col justify-between px-6 py-10 sm:px-10 sm:py-14 lg:py-16 lg:pl-16 lg:pr-10">
                  <div>
                    {/* Badge Habitat */}
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 px-3.5 py-1.5 mb-6 shadow-sm">
                      <span className="size-5 rounded-full bg-[#FACC15] flex items-center justify-center text-[#18181B] shadow-xs">
                        <HomeIcon size={12} strokeWidth={2.5} />
                      </span>
                      <span className="text-xs font-extrabold tracking-wide text-white">Habitat</span>
                    </div>

                    {/* Título Principal */}
                    <h2 className="text-[32px] sm:text-[42px] lg:text-[46px] xl:text-[52px] font-black tracking-tight leading-[1.08] text-white">
                      ¿Tienes un espacio<br />
                      <span className="text-[#FACC15] inline-flex items-center">
                        para alquilar?
                        {/* Rayos doodle amarillos */}
                        <svg
                          className="ml-3 sm:ml-4 w-7 h-7 sm:w-9 sm:h-9 text-[#FACC15] shrink-0"
                          viewBox="0 0 32 32"
                          fill="none"
                        >
                          <path
                            d="M6 14 L18 8"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />
                          <path
                            d="M8 20 L22 19"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />
                          <path
                            d="M7 26 L19 29"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                    </h2>

                    {/* Subtítulo */}
                    <p className="mt-4 sm:mt-5 text-sm sm:text-base text-zinc-300 font-medium leading-relaxed max-w-lg">
                      Publica tu alojamiento y conecta con estudiantes de las principales universidades de Arequipa.
                    </p>
                  </div>

                  {/* Fila Inferior: Botón CTA + 3 Puntos Clave */}
                  <div className="mt-8 sm:mt-10 pt-4 flex flex-col xl:flex-row xl:items-center gap-6 xl:gap-8">
                    {/* Botón Principal */}
                    <Link
                      href="/registro/propietario"
                      className="inline-flex items-center justify-center gap-2 bg-[#FACC15] hover:bg-[#EAB308] text-[#18181B] font-black text-sm sm:text-[15px] px-6 sm:px-7 py-3.5 rounded-2xl shadow-[0_4px_16px_rgba(250,204,21,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0 w-full sm:w-auto text-center"
                    >
                      Publicar alojamiento <ArrowRight size={16} strokeWidth={2.5} />
                    </Link>

                    {/* 3 Badges de Características */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 items-center border-t border-white/10 xl:border-t-0 xl:border-l xl:pl-6 pt-4 xl:pt-0">
                      {/* Característica 1 */}
                      <div className="flex items-center gap-2 sm:gap-2.5">
                        <div className="size-8 sm:size-9 rounded-full bg-[#FACC15] flex items-center justify-center text-[#18181B] shrink-0 shadow-sm">
                          <ShieldCheck size={16} strokeWidth={2.5} />
                        </div>
                        <span className="text-[11px] sm:text-xs font-bold text-white leading-tight">
                          Seguro<br />y confiable
                        </span>
                      </div>

                      {/* Característica 2 */}
                      <div className="flex items-center gap-2 sm:gap-2.5">
                        <div className="size-8 sm:size-9 rounded-full bg-[#FACC15] flex items-center justify-center text-[#18181B] shrink-0 shadow-sm">
                          <Users size={16} strokeWidth={2.5} />
                        </div>
                        <span className="text-[11px] sm:text-xs font-bold text-white leading-tight">
                          Conecta con<br />estudiantes
                        </span>
                      </div>

                      {/* Característica 3 */}
                      <div className="flex items-center gap-2 sm:gap-2.5">
                        <div className="size-8 sm:size-9 rounded-full bg-[#FACC15] flex items-center justify-center text-[#18181B] shrink-0 shadow-sm">
                          <MapPin size={16} strokeWidth={2.5} />
                        </div>
                        <span className="text-[11px] sm:text-xs font-bold text-white leading-tight">
                          En todo<br />Arequipa
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Imagen public/foto-cta.png */}
                <div className="lg:col-span-5 relative w-full h-[280px] sm:h-[360px] lg:h-auto min-h-[320px] lg:min-h-full overflow-hidden">
                  <Image
                    src="/foto-cta.png"
                    alt="¿Tienes un espacio para alquilar? Publica tu alojamiento en Habitat"
                    fill
                    className="object-cover object-center lg:object-left-top"
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="bg-[#18181B] text-white px-4 sm:px-6 lg:px-8 xl:px-10 pt-14 sm:pt-16 pb-8">
        <div className="mx-auto max-w-[1600px] w-full">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12 sm:mb-16">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-2 lg:col-span-1">
              <BrandLogo compact />
              <p className="mt-3 text-[13px] text-zinc-400 leading-relaxed max-w-xs">
                Tu espacio, más cerca. Encuentra alojamiento cerca de tu universidad.
              </p>
            </div>
            {/* Descubre */}
            <div>
              <h3 className="text-[13px] font-extrabold uppercase tracking-[0.1em] text-white mb-4">Descubre</h3>
              <nav className="grid gap-2.5 text-[13px] text-zinc-400">
                <Link href="/buscar" className="hover:text-white transition">Buscar alojamiento</Link>
                <Link href="/buscar?ciudad=Arequipa" className="hover:text-white transition">Buscar en Arequipa</Link>
                <Link href="#universidades" className="hover:text-white transition">Universidades</Link>
                <Link href="#como-funciona" className="hover:text-white transition">Cómo funciona</Link>
              </nav>
            </div>
            {/* Propietarios */}
            <div>
              <h3 className="text-[13px] font-extrabold uppercase tracking-[0.1em] text-white mb-4">Propietarios</h3>
              <nav className="grid gap-2.5 text-[13px] text-zinc-400">
                <Link href="/registro/propietario" className="hover:text-white transition">Publicar alojamiento</Link>
                <Link href="/propietario" className="hover:text-white transition">Mi panel</Link>
                <Link href="/propietario/nuevo" className="hover:text-white transition">Guía para propietarios</Link>
              </nav>
            </div>
            {/* Ayuda + Social */}
            <div>
              <h3 className="text-[13px] font-extrabold uppercase tracking-[0.1em] text-white mb-4">Ayuda</h3>
              <nav className="grid gap-2.5 text-[13px] text-zinc-400 mb-6">
                <Link href="/login" className="hover:text-white transition">Contacto</Link>
                <Link href="/login" className="hover:text-white transition">Preguntas frecuentes</Link>
                <Link href="/login" className="hover:text-white transition">Términos y políticas</Link>
              </nav>
              <h3 className="text-[13px] font-extrabold uppercase tracking-[0.1em] text-white mb-3">Síguenos</h3>
              <div className="flex items-center gap-3">
                <a href="#" aria-label="Instagram" className="grid size-8 place-items-center rounded-full bg-white/10 hover:bg-[#FACC15] hover:text-[#18181B] transition">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                <a href="#" aria-label="TikTok" className="grid size-8 place-items-center rounded-full bg-white/10 hover:bg-[#FACC15] hover:text-[#18181B] transition">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z"/></svg>
                </a>
                <a href="#" aria-label="Facebook" className="grid size-8 place-items-center rounded-full bg-white/10 hover:bg-[#FACC15] hover:text-[#18181B] transition">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="#" aria-label="YouTube" className="grid size-8 place-items-center rounded-full bg-white/10 hover:bg-[#FACC15] hover:text-[#18181B] transition">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 1.96C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 text-center text-[12px] text-zinc-500">
            © 2026 Habitat. Hecho para estudiantes.
          </div>
        </div>
      </footer>
    </div>
  )
}
