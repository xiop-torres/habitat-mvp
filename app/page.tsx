'use client'

import Link from 'next/link'
import { BrandLogo } from '@/components/BrandLogo'
import { useState } from 'react'
import { ArrowRight, Heart, Menu, Search, Sparkles, X } from 'lucide-react'
import { Button, PrimaryButton, SecondaryButton } from '@/components/ui/button'
import { RoomCard } from '@/components/RoomCard'

const regions = [
  'Arequipa', 'Lima', 'Cusco', 'Trujillo', 'Cajamarca', 'Piura', 'Iquitos', 'Puno'
]

const universities = [
  { name: 'UNSA', count: 128, area: 'Cercado', region: 'Arequipa', image: '/habitat-room.png' },
  { name: 'UCSM', count: 94, area: 'Yanahuara', region: 'Arequipa', image: '/habitat-hero.png' },
  { name: 'Universidad Católica San Pablo', count: 76, area: 'Cayma', region: 'Arequipa', image: '/habitat-room.png' },
  { name: 'UTP', count: 58, area: 'Cercado', region: 'Arequipa', image: '/habitat-hero.png' },
  { name: 'Universidad La Salle', count: 42, area: 'Cayma', region: 'Arequipa', image: '/habitat-room.png' },
]

const properties = [
  { id: 1, title: 'Habitación privada cerca de la UCSM', district: 'Yanahuara', region: 'Arequipa', price: 650, distance: '1.2 km de la UCSM', type: 'Habitación individual', services: 'Amoblado · WiFi · Agua incluida', image: '/habitat-room.png' },
  { id: 2, title: 'Mini departamento para estudiantes', district: 'Cayma', region: 'Arequipa', price: 950, distance: '1.8 km de la UCSM', type: 'Departamento', services: 'Cocina · Lavandería · Luz incluida', image: '/habitat-hero.png' },
  { id: 3, title: 'Habitación luminosa en el centro', district: 'Cercado', region: 'Arequipa', price: 480, distance: '0.8 km de la UNSA', type: 'Habitación individual', services: 'Escritorio · WiFi · Baño privado', image: '/habitat-room.png' },
  { id: 4, title: 'Casa compartida para universitarios', district: 'José Luis Bustamante', region: 'Arequipa', price: 420, distance: '1.5 km de la UNSA', type: 'Habitación compartida', services: 'Cocina · Patio · Limpieza', image: '/habitat-hero.png' },
]

function Navbar() {
  const [open, setOpen] = useState(false)
  return <header className="border-b border-border bg-background/95 backdrop-blur"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8"><BrandLogo compact /><nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:flex"><Link className="transition-colors hover:text-foreground" href="/buscar">Buscar</Link><Link className="transition-colors hover:text-foreground" href="#como-funciona">Cómo funciona</Link><Link className="transition-colors hover:text-foreground" href="/propietarios">Propietarios</Link><Link className="transition-colors hover:text-foreground" href="/favoritos">Favoritos</Link></nav><div className="hidden items-center gap-3 text-sm lg:flex"><Link href="/registro" className="px-3 py-2 hover:text-foreground">Iniciar sesión</Link><PrimaryButton nativeButton={false} render={<Link href="/propietarios" />}>Publicar alojamiento</PrimaryButton></div><Button variant="ghost" size="icon" aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)} className="lg:hidden">{open ? <X /> : <Menu />}</Button></div>{open && <div id="mobile-navigation" className="border-t border-border px-4 py-3 lg:hidden"><nav className="flex flex-col gap-3 text-sm font-medium mb-4"><Link href="/buscar">Buscar alojamiento</Link><Link href="#como-funciona">Cómo funciona</Link><Link href="/propietarios">Publicar alojamiento</Link><Link href="/favoritos">Favoritos</Link></nav><PrimaryButton nativeButton={false} render={<Link href="/propietarios" />} className="w-full">Publicar alojamiento</PrimaryButton></div>}</header>
}

function SearchBar() {
  const [city, setCity] = useState('Arequipa')
  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl bg-white p-4 shadow-lg">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_0.9fr_auto]">
        <div className="flex flex-col gap-1">
          <label htmlFor="search-region" className="text-xs font-semibold text-muted-foreground">Región</label>
          <select id="search-region" value={city} onChange={(e) => setCity(e.target.value)} className="flex items-center gap-1 rounded-lg bg-gray-50 px-3 py-3 text-sm font-medium border border-gray-200">
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="search-university" className="text-xs font-semibold text-muted-foreground">Universidad</label>
          <select id="search-university" className="flex items-center gap-1 rounded-lg bg-gray-50 px-3 py-3 text-sm font-medium border border-gray-200">
            <option>Selecciona universidad</option>
            {universities.filter(u => u.region === city).map(u => <option key={u.name} value={u.name}>{u.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="search-price" className="text-xs font-semibold text-muted-foreground">Precio máximo</label>
          <select id="search-price" className="flex items-center gap-1 rounded-lg bg-gray-50 px-3 py-3 text-sm font-medium border border-gray-200">
            <option>S/ 2,000+</option>
            <option>S/ 500</option>
            <option>S/ 1,000</option>
            <option>S/ 1,500</option>
          </select>
        </div>
        <PrimaryButton nativeButton={false} render={<Link href="/buscar" />} className="self-end">
          <Search size={18} />
          <span>Buscar</span>
        </PrimaryButton>
      </div>
    </div>
  )
}

function PropertyCard({ property }: { property: typeof properties[number] }) {
  const [saved, setSaved] = useState(false)
  return <RoomCard room={property} favoriteAction={
    <SecondaryButton size="icon" aria-label={saved ? 'Quitar de favoritos' : 'Guardar en favoritos'} aria-pressed={saved}
      onClick={() => setSaved(!saved)} className="rounded-full">
      <Heart size={18} className={saved ? 'fill-primary text-foreground' : ''} />
    </SecondaryButton>
  } />
}

function Footer() { return <footer className="border-t border-border bg-secondary/40"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-8"><div><BrandLogo /><p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">Tu próximo hogar empieza aquí. Encuentra un espacio que se sienta como tuyo.</p><p className="mt-6 text-sm text-muted-foreground">Arequipa, Perú</p></div><div><p className="mb-4 text-sm font-bold">Descubre</p><div className="flex flex-col gap-3 text-sm text-muted-foreground"><Link href="/buscar">Buscar alojamiento</Link><Link href="#universidades">Universidades</Link><Link href="#como-funciona">Cómo funciona</Link></div></div><div><p className="mb-4 text-sm font-bold">Propietarios</p><div className="flex flex-col gap-3 text-sm text-muted-foreground"><Link href="/propietarios">Publicar alojamiento</Link><Link href="/propietario">Mi panel</Link><Link href="/preguntas">Preguntas frecuentes</Link></div></div><div><p className="mb-4 text-sm font-bold">Legal</p><div className="flex flex-col gap-3 text-sm text-muted-foreground"><Link href="/terminos">Términos y condiciones</Link><Link href="/privacidad">Política de privacidad</Link></div></div></div><div className="mx-auto max-w-7xl border-t border-border px-5 py-5 text-xs text-muted-foreground lg:px-8">© 2026 Habitat. Hecho para estudiantes de Arequipa.</div></footer> }

export default function Page() { return <div><Navbar /><main><section className="mx-auto max-w-7xl px-5 pb-16 pt-10 lg:px-8 lg:pb-24 lg:pt-16"><div className="relative overflow-hidden rounded-[2rem] bg-secondary text-foreground"><img src="/habitat-hero.png" alt="Estudiante estudiando en su nuevo hogar" className="absolute inset-y-0 right-0 h-full w-full object-cover opacity-25 lg:w-1/2 lg:opacity-55" /><div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/95 to-transparent" /><div className="relative flex min-h-[470px] flex-col justify-center p-7 sm:p-12 lg:min-h-[520px] lg:max-w-2xl lg:p-16"><div className="mb-10 flex items-center gap-2 text-sm font-medium text-muted-foreground"><span className="grid size-7 place-items-center rounded-full bg-primary text-primary-foreground"><Sparkles size={14} /></span> El hogar que acompaña tu etapa universitaria</div><div><p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-foreground">Alojamiento estudiantil en todo el Perú</p><h1 className="max-w-xl text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">Encuentra tu lugar cerca de la universidad</h1><p className="mt-5 max-w-lg text-pretty text-base leading-7 text-muted-foreground sm:text-lg">Habitaciones y alojamientos para estudiantes en Perú, con precios claros, servicios y ubicación cerca de tu campus.</p></div></div><div className="relative px-4 pb-5 sm:px-12 sm:pb-8 lg:absolute lg:bottom-8 lg:left-auto lg:right-8 lg:w-[min(890px,calc(100%-4rem))] lg:p-0"><SearchBar /></div></div><div className="mt-10 grid grid-cols-2 gap-4 text-center sm:grid-cols-4 lg:mt-12"><div><p className="text-2xl font-bold">398+</p><p className="mt-1 text-xs text-muted-foreground">alojamientos listados</p></div><div><p className="text-2xl font-bold">5</p><p className="mt-1 text-xs text-muted-foreground">universidades conectadas</p></div><div><p className="text-2xl font-bold">100%</p><p className="mt-1 text-xs text-muted-foreground">pensado para estudiantes</p></div><div><p className="text-2xl font-bold">Todo Perú</p><p className="mt-1 text-xs text-muted-foreground">y seguimos creciendo</p></div></div></section><section id="universidades" className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-20"><div className="mb-8 flex items-end justify-between gap-4"><div><p className="mb-2 text-sm font-semibold text-foreground">Tu universidad, tu zona</p><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Explora por universidad</h2><p className="mt-2 text-muted-foreground">Comienza buscando cerca de donde vas a estudiar.</p></div><Link href="/buscar" className="hidden items-center gap-2 text-sm font-semibold sm:flex">Ver todas <ArrowRight size={16} /></Link></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{universities.map((university) => <Link href="/buscar" key={university.name} className="group relative aspect-[1.15] overflow-hidden rounded-3xl bg-muted"><img src={university.image} alt={university.name} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" /><div className="absolute bottom-0 p-5 text-white"><p className="text-lg font-bold">{university.name}</p><p className="mt-1 text-sm text-white/75">{university.count} alojamientos</p></div></Link>)}</div></section><section className="bg-secondary/50"><div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20"><div className="mb-8 flex items-end justify-between gap-4"><div><p className="mb-2 text-sm font-semibold text-foreground">Elegidos para ti</p><h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Alojamientos para estudiantes</h2><p className="mt-2 text-muted-foreground">Espacios revisados para que empieces tu búsqueda con confianza.</p></div><Link href="/buscar" className="hidden items-center gap-2 text-sm font-semibold sm:flex">Ver todos <ArrowRight size={16} /></Link></div><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{properties.map((property) => <PropertyCard key={property.id} property={property} />)}</div></div></section><section id="como-funciona" className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24"><div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center"><div><p className="mb-3 text-sm font-semibold text-foreground">Así de simple</p><h2 className="max-w-md text-3xl font-bold tracking-tight sm:text-4xl">Tu próximo hogar, en tres pasos</h2><p className="mt-4 max-w-md leading-7 text-muted-foreground">Te ayudamos a comparar lo importante para que puedas enfocarte en lo que viene.</p><Link href="/buscar" className="mt-7 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 font-semibold text-background transition-transform hover:-translate-y-0.5">Empezar a buscar <ArrowRight size={17} /></Link></div><div className="grid gap-4 sm:grid-cols-3">{[['01','Busca','Selecciona tu universidad, facultad y presupuesto.'],['02','Compara','Revisa ubicación, precio, fotos y servicios.'],['03','Contacta','Habla con el propietario y coordina una visita.']].map(([number,title,copy]) => <div key={number} className="rounded-3xl border border-border p-6"><span className="text-sm font-bold text-primary">{number}</span><h3 className="mt-8 text-xl font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{copy}</p></div>)}</div></div></section><section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8 lg:pb-24"><div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-primary p-8 sm:p-12 lg:flex-row lg:items-center"><div><p className="text-sm font-bold uppercase tracking-widest text-primary-foreground/70">¿Tienes un espacio disponible?</p><h2 className="mt-3 max-w-lg text-3xl font-bold tracking-tight text-primary-foreground">Publica tu alojamiento y llega a estudiantes que están buscando dónde vivir.</h2></div><Link href="/propietarios" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-foreground px-6 py-3.5 font-semibold text-background transition-transform hover:-translate-y-0.5">Conoce más <ArrowRight size={17} /></Link></div></section></main><Footer /></div> }
