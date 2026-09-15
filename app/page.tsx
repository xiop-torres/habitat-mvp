'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import {
  ArrowRight,
  Building2,
  CalendarCheck2,
  Check,
  Heart,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  Star,
  Users,
  X,
} from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { Footer } from '@/components/Shared'
import { Button, PrimaryButton } from '@/components/ui/button'
import { mockRooms } from '@/lib/mocks'

const stats = [
  { value: '450+', label: 'Alojamientos listados', icon: Building2 },
  { value: '6 sedes', label: 'Universidades de Arequipa', icon: MapPin },
  { value: '100%', label: 'Pensado para universitarios', icon: ShieldCheck },
  { value: '2,400+', label: 'Visitas agendadas', icon: CalendarCheck2 },
]

const campuses = [
  { name: 'UNSA', subtitle: 'Ingenierías & Sociales', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80', accent: 'Desde 5 min a pie', href: '/buscar?universidad=UNSA' },
  { name: 'UCSM', subtitle: 'Católica Santa María', image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80', accent: 'Campus Umacollo', href: '/buscar?universidad=UCSM' },
  { name: 'UCSP', subtitle: 'Universidad San Pablo', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80', accent: 'San Lázaro', href: '/buscar?universidad=Universidad%20Cat%C3%B3lica%20San%20Pablo' },
  { name: 'UTP', subtitle: 'Tecnológica del Perú', image: '/habitat-hero.png', accent: 'Torre Tacna', href: '/buscar?universidad=UTP' },
  { name: 'La Salle', subtitle: 'Universidad La Salle', image: '/habitat-room.png', accent: 'Campus principal', href: '/buscar?universidad=Universidad%20La%20Salle' },
]

const steps = [
  {
    number: '01',
    title: 'Busca cerca de tu campus',
    text: 'Filtra por universidad, precio y servicios.',
  },
  {
    number: '02',
    title: 'Conoce el alojamiento',
    text: 'Revisa fotos, distancia, servicios y disponibilidad.',
  },
  {
    number: '03',
    title: 'Coordina una visita',
    text: 'Escribe al propietario y agenda la visita ideal.',
  },
]

const highlightRooms = mockRooms.slice(0, 4)

export default function HomePage() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [city, setCity] = useState('Arequipa')
  const [university, setUniversity] = useState('')

  function handleSearch(event: FormEvent) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (city) params.set('ciudad', city)
    if (university) params.set('universidad', university)
    const query = params.toString() ? `?${params.toString()}` : ''
    router.push(`/buscar${query}`)
  }

  return (
    <div className="min-h-screen bg-[#FEFDF8] text-[#18181B]">
      <header className="sticky top-0 z-50 border-b border-[#E4E4E7] bg-[#FEFDF8]/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <BrandLogo compact />

          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#71717A] lg:flex">
            <Link href="/buscar" className="transition hover:text-[#18181B]">Buscar</Link>
            <Link href="#universidades" className="transition hover:text-[#18181B]">Universidades</Link>
            <Link href="#como-funciona" className="transition hover:text-[#18181B]">Cómo funciona</Link>
            <Link href="/propietario" className="transition hover:text-[#18181B]">Para propietarios</Link>
            <Link href="/favoritos" className="inline-flex items-center gap-1.5 transition hover:text-[#18181B]">
              <Heart size={16} className="text-[#71717A]" /> Favoritos
            </Link>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/login" className="px-3 py-2 text-sm font-semibold text-[#18181B] transition hover:text-[#71717A]">
              Iniciar sesión
            </Link>
            <Link href="/registro/propietario" className="inline-flex h-11 items-center justify-center rounded-xl bg-[#FACC15] px-5 text-sm font-bold text-[#18181B] transition hover:bg-[#EAB308]">
              Publicar alojamiento
            </Link>
          </div>

          <Button
            variant="ghost"
            size="icon"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </Button>
        </div>

        {menuOpen && (
          <div className="border-t border-[#E4E4E7] bg-[#FEFDF8] px-4 py-4 lg:hidden">
            <nav className="grid gap-3 text-sm font-semibold text-[#18181B]">
              <Link href="/buscar">Buscar alojamiento</Link>
              <Link href="#universidades">Universidades</Link>
              <Link href="#como-funciona">Cómo funciona</Link>
              <Link href="/login">Iniciar sesión</Link>
            </nav>
            <Link href="/registro/propietario" className="mt-4 inline-flex w-full justify-center rounded-xl bg-[#FACC15] px-4 py-3 text-sm font-bold text-[#18181B]">
              Publicar alojamiento
            </Link>
          </div>
        )}
      </header>

      <main>
        <section id="buscar" className="relative overflow-hidden bg-[#FEFDF8] pt-8 pb-16 lg:pt-14 lg:pb-20">
          <div className="absolute -right-20 top-20 h-80 w-80 rounded-full bg-[#FACC15]/25 blur-3xl" />
          <div className="absolute left-0 top-0 hidden h-full w-1/2 bg-[#F4F2EB]/80 lg:block" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#FACC15]/40 bg-[#FACC15]/10 px-3 py-1.5 text-xs font-bold text-[#18181B] shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                  El hogar que acompaña tu etapa universitaria
                </div>

                <h1 className="mt-6 max-w-xl text-4xl font-extrabold tracking-tight text-[#18181B] sm:text-5xl lg:text-6xl lg:leading-[1.08]">
                  Encuentra tu lugar ideal<br />
                  cerca de tu <span className="text-[#FACC15]">universidad</span>
                </h1>

                <p className="mt-5 max-w-xl text-lg leading-8 text-[#71717A]">
                  Habitaciones, viviendas y departamentos pensados para estudiantes, con información clara y a pocos minutos caminando de tu campus.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold text-[#18181B]">
                  <span className="rounded-lg border border-[#E4E4E7] bg-white px-3 py-1.5">✅ Verificación simple</span>
                  <span className="rounded-lg border border-[#E4E4E7] bg-white px-3 py-1.5">📍 Cerca a tu facultad</span>
                  <span className="rounded-lg border border-[#E4E4E7] bg-white px-3 py-1.5">💬 Contacto directo</span>
                </div>

                <form onSubmit={handleSearch} className="mt-8 w-full rounded-[28px] border border-[#E4E4E7] bg-white p-3 shadow-[0_16px_40px_rgba(24,24,27,0.08)] sm:p-4">
                  <div className="grid gap-3 lg:grid-cols-[1.05fr_1.45fr_0.9fr_1.55fr] lg:items-stretch">
                    <label className="flex h-[88px] min-w-0 flex-col justify-center rounded-2xl border border-[#E4E4E7] bg-[#F4F2EB] px-4 py-3 transition focus-within:border-[#FACC15] focus-within:ring-2 focus-within:ring-[#FACC15]/20">
                      <span className="block text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#71717A]">Ciudad</span>
                      <div className="mt-1 flex items-center gap-2">
                        <MapPin size={16} className="shrink-0 text-[#EAB308]" />
                        <select
                          aria-label="Selecciona tu ciudad"
                          value={city}
                          onChange={(event) => setCity(event.target.value)}
                          className="w-full min-w-0 border-0 bg-transparent p-0 text-sm font-bold text-[#18181B] outline-none"
                        >
                          <option value="Arequipa">Arequipa</option>
                          <option value="Lima">Lima</option>
                          <option value="Cusco">Cusco</option>
                          <option value="Trujillo">Trujillo</option>
                        </select>
                      </div>
                    </label>

                    <label className="flex h-[88px] min-w-0 flex-col justify-center rounded-2xl border border-[#E4E4E7] bg-[#F4F2EB] px-4 py-3 transition focus-within:border-[#FACC15] focus-within:ring-2 focus-within:ring-[#FACC15]/20">
                      <span className="block text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#71717A]">Universidad</span>
                      <select
                        aria-label="Selecciona tu universidad"
                        value={university}
                        onChange={(event) => setUniversity(event.target.value)}
                        className="mt-1 w-full min-w-0 border-0 bg-transparent p-0 text-sm font-bold text-[#18181B] outline-none"
                      >
                        <option value="">Selecciona tu universidad</option>
                        <option value="UNSA">UNSA</option>
                        <option value="UCSM">UCSM</option>
                        <option value="Universidad Católica San Pablo">Universidad Católica San Pablo</option>
                        <option value="UTP">UTP</option>
                        <option value="Universidad La Salle">Universidad La Salle</option>
                      </select>
                    </label>

                    <label className="flex h-[88px] min-w-0 flex-col justify-center rounded-2xl border border-[#E4E4E7] bg-[#F4F2EB] px-4 py-3 transition focus-within:border-[#FACC15] focus-within:ring-2 focus-within:ring-[#FACC15]/20">
                      <span className="block text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#71717A]">Máx. precio</span>
                      <div className="mt-1 flex items-center gap-2 text-sm font-bold text-[#18181B]">
                        <span className="text-[#71717A]">S/</span>
                        <input aria-label="Precio máximo mensual" type="number" defaultValue={800} className="w-full min-w-0 border-0 bg-transparent p-0 text-sm font-bold text-[#18181B] outline-none" />
                      </div>
                    </label>

                    <PrimaryButton type="submit" className="h-[88px] w-full rounded-2xl px-5 text-sm font-bold">
                      <Search size={16} /> Buscar alojamientos
                    </PrimaryButton>
                  </div>
                </form>
              </div>

              <div className="relative lg:col-span-4">
                <div className="relative mx-auto max-w-[480px]">
                  <div className="relative overflow-hidden rounded-[32px] border-[6px] border-white bg-[#F4F2EB] shadow-[0_25px_60px_rgba(24,24,27,0.12)]">
                    <img
                      src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
                      alt="Estudiante feliz en su habitación universitaria"
                      className="h-[460px] w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#18181B]/80 via-[#18181B]/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <span className="inline-block rounded-md bg-[#FACC15] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#18181B]">
                        Campus Yanahuara
                      </span>
                      <h3 className="mt-3 text-2xl font-black leading-tight">Vive con comodidad y concéntrate en tus estudios.</h3>
                    </div>
                  </div>

                  <div className="absolute -right-3 top-5 flex items-center gap-3 rounded-2xl border border-[#E4E4E7] bg-white p-3 shadow-lg">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#10B981]/10 text-[#10B981]">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.1em] text-[#18181B]">100% Presencial</p>
                      <p className="text-[11px] text-[#71717A]">Auditoría con fotos reales</p>
                    </div>
                  </div>

                  <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl border border-[#E4E4E7] bg-white/95 p-3 shadow-lg backdrop-blur">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80"
                      alt="Anfitriona"
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-black text-[#18181B]">S/ 580 / mes</p>
                      <p className="text-[11px] text-[#71717A]">A 4 min de UCSM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[#E4E4E7] bg-white py-10">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
            {stats.map(({ value, label, icon: Icon }, index) => {
              const accents = [
                { panel: 'bg-[#FFF7CC]', icon: 'bg-[#FACC15] text-[#18181B]', number: 'text-[#A16207]' },
                { panel: 'bg-[#E8F5F1]', icon: 'bg-[#10B981] text-white', number: 'text-[#047857]' },
                { panel: 'bg-[#EAF1FF]', icon: 'bg-[#2563EB] text-white', number: 'text-[#1D4ED8]' },
                { panel: 'bg-[#FFF0E7]', icon: 'bg-[#F97316] text-white', number: 'text-[#C2410C]' },
              ][index]

              return (
                <div key={label} className={`group flex min-h-[116px] items-center gap-4 rounded-[24px] border border-transparent p-5 transition hover:-translate-y-1 hover:shadow-lg ${accents.panel}`}>
                  <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl shadow-sm ${accents.icon}`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <p className={`text-3xl font-black tracking-tight ${accents.number}`}>{value}</p>
                    <p className="mt-1 text-xs font-bold leading-5 text-[#52525B]">{label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section id="universidades" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#EAB308]">Tu universidad, tu zona</p>
              <h2 className="mt-2 text-3xl font-black text-[#18181B]">Explora por campus universitario</h2>
            </div>
            <Link href="/buscar" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#18181B]">
              Ver todas las universidades <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {campuses.map((campus, index) => (
              <Link key={campus.name} href={campus.href} className="group relative h-72 overflow-hidden rounded-[26px] shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl">
                <img src={campus.image} alt={campus.name} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#18181B]/95 via-[#18181B]/30 to-transparent" />
                <div className="relative z-10 flex h-full flex-col justify-end p-4 text-white">
                  <span className="mb-2 inline-flex w-fit rounded-md bg-[#FACC15] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#18181B]">
                    {campus.accent}
                  </span>
                  <h3 className="text-2xl font-black">{campus.name}</h3>
                  <p className="mt-1 text-xs text-zinc-200">{campus.subtitle}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-white/20 pt-3">
                    <span className="text-xs font-bold text-[#FACC15]">{index === 0 ? '142 alojamientos' : index === 1 ? '118 alojamientos' : index === 2 ? '84 alojamientos' : index === 3 ? '65 alojamientos' : '46 alojamientos'}</span>
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-white/15 group-hover:bg-[#FACC15] group-hover:text-[#18181B]">
                      <ArrowRight size={15} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-y border-[#E4E4E7] bg-[#F4F2EB] py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#EAB308]">Elegidos para ti</p>
                <h2 className="mt-2 text-3xl font-black text-[#18181B]">Alojamientos destacados para universitarios</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Todos', 'Cerca a UCSM', 'Cerca a UNSA', 'Minidepartamentos', 'Baño privado'].map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${filter === 'Todos' ? 'border-[#18181B] bg-[#18181B] text-white' : 'border-[#E4E4E7] bg-white text-[#71717A] hover:bg-[#FEFDF8]'}`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {highlightRooms.map((room) => (
                <article key={room.id} className="group overflow-hidden rounded-[26px] border border-[#E4E4E7] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative overflow-hidden">
                    <img src={room.image} alt={room.title} className="h-56 w-full object-cover transition duration-500 group-hover:scale-105" />
                    {room.verified && (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-black text-[#10B981] shadow-sm">
                        <ShieldCheck size={12} /> Alojamiento verificado
                      </span>
                    )}
                    <button type="button" aria-label="Guardar alojamiento" className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[#18181B] shadow-sm">
                      <Heart size={15} />
                    </button>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-2xl font-black text-[#18181B]">
                        S/ {room.price}
                        <span className="text-xs font-normal text-[#71717A]">/ mes</span>
                      </p>
                    </div>
                    <h3 className="mt-2 text-xl font-bold text-[#18181B]">{room.title}</h3>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-[#71717A]">
                      <MapPin size={15} className="text-[#FACC15]" />
                      {room.district} · {room.distance}
                    </p>
                    <p className="mt-3 text-sm text-[#71717A]">{room.services}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold text-[#71717A]">
                      {room.amenities.slice(0, 3).map((item) => (
                        <span key={item} className="rounded-full bg-[#F4F2EB] px-2.5 py-1">{item}</span>
                      ))}
                    </div>
                    <Link href={`/alojamiento/${room.id}`} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F4F2EB] px-4 py-3 text-sm font-bold text-[#18181B] transition hover:bg-[#FACC15]">
                      Ver alojamiento <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="como-funciona" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#EAB308]">¿Cómo funciona?</p>
            <h2 className="mt-3 text-3xl font-black text-[#18181B]">Tu próximo hogar en tres pasos</h2>
            <p className="mt-3 text-[#71717A]">Diseñado para que encuentres un espacio real, sin rodeos ni información extra.</p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.number} className="rounded-[28px] border border-[#E4E4E7] bg-white p-6 shadow-sm">
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#FACC15] text-sm font-black text-[#18181B]">
                  {step.number}
                </div>
                <h3 className="text-xl font-black text-[#18181B]">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#71717A]">{step.text}</p>
                {index < 2 && <div className="mt-6 h-px w-full bg-[#E4E4E7]" />}
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-[28px] border border-[#E4E4E7] bg-[#18181B] p-6 text-white shadow-lg lg:p-8">
            <div className="grid items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#FACC15]">Testimonio</p>
                <p className="mt-4 text-2xl font-black leading-tight">
                  “Habitat me ayudó a encontrar un lugar digno y cerca de mi universidad sin perder tiempo.”
                </p>
              </div>
              <div className="rounded-[24px] bg-white/5 p-5 ring-1 ring-white/10">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80"
                    alt="Estudiante testimonial"
                    className="h-14 w-14 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-black">Diana Mendoza</p>
                    <p className="text-sm text-zinc-300">Arquitectura · UCSM</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-[#FACC15]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={16} fill="currentColor" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#18181B] py-16 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#FACC15]">Garantía Habitat</p>
              <h2 className="mt-3 text-3xl font-black">Alojamiento seguro, claro y pensado para estudiantes.</h2>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                { title: 'Auditoría presencial', text: 'Revisamos fotos y ubicación para ayudarte a tomar decisiones con más confianza.', icon: ShieldCheck },
                { title: 'Trato simple', text: 'La comunicación es directa, clara y enfocada en lo que necesitas.', icon: Users },
                { title: 'Contacto WhatsApp', text: 'Puedes escribir al propietario con rapidez y coordinar una visita.', icon: CalendarCheck2 },
              ].map(({ title, text, icon: Icon }) => (
                <div key={title} className="rounded-[26px] border border-white/10 bg-white/5 p-6">
                  <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#FACC15] text-[#18181B]">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-xl font-black">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-300">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid items-center gap-6 overflow-hidden rounded-[30px] bg-[#FACC15] p-6 text-[#18181B] shadow-[0_18px_40px_rgba(250,204,21,0.25)] lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#18181B]/70">¿Tienes un espacio?</p>
              <h2 className="mt-3 text-3xl font-black lg:text-5xl">Publica tu alojamiento y conecta con estudiantes verificados y responsables.</h2>
              <ul className="mt-6 space-y-3 text-sm font-medium text-[#18181B]/80">
                {['Publica en minutos con formulario claro.', 'Llega a estudiantes cerca de tu universidad.', 'Gestiona solicitudes y visitas con facilidad.'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check size={16} className="text-[#18181B]" /> {item}
                  </li>
                ))}
              </ul>
              <Link href="/registro/propietario" className="mt-8 inline-flex items-center justify-center rounded-xl bg-[#18181B] px-6 py-3 text-sm font-bold text-white transition hover:opacity-90">
                Publicar mi alojamiento
              </Link>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=900&q=80"
                alt="Propietario hablando con un estudiante"
                className="h-[320px] w-full rounded-[26px] object-cover shadow-xl"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
