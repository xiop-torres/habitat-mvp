'use client'

import Link from 'next/link'
import { use, useState } from 'react'
import {
  ArrowRight,
  Bath,
  BedDouble,
  CalendarDays,
  Check,
  Clock3,
  Heart,
  House,
  MapPin,
  MessageCircle,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Wifi,
  Zap,
} from 'lucide-react'
import { AppHeader, Footer, Toast, VisitRequestModal } from '@/components/Shared'
import HabitatMap from '@/components/HabitatMap'
import { mockRooms } from '@/lib/mocks'

const detailImages = ['/habitat-room.png', '/habitat-hero.png', '/placeholder.jpg', '/habitat-room.png', '/habitat-hero.png']
const amenities = [
  ['WiFi fibra óptica 200 Mbps', 'Ideal para clases virtuales y descargas.', Wifi],
  ['Agua caliente 24/7', 'Terma con respaldo eléctrico.', Sparkles],
  ['Luz y agua incluidos', 'Sin cobros sorpresa a fin de mes.', Zap],
  ['Cocina integral equipada', 'Refrigerador, cocina y vajilla.', House],
  ['Escritorio y silla ergonómica', 'Espacio cómodo para estudiar.', BedDouble],
  ['Lavandería y tendal techado', 'Turnos ordenados para residentes.', Sparkles],
] as const

const rules = [
  ['Prohibido fumar', 'En habitaciones y zonas comunes interiores.'],
  ['Mascotas', 'No se permiten por tranquilidad comunitaria.'],
  ['Horario de silencio', '10:30 PM - 07:00 AM para descansar y estudiar.'],
  ['Visitas académicas', 'Permitidas hasta las 9:00 PM con registro previo.'],
]

export default function PropertyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const room = mockRooms.find(item => String(item.id) === id) ?? mockRooms[0]
  const [saved, setSaved] = useState(false)
  const [visitOpen, setVisitOpen] = useState(false)
  const [toast, setToast] = useState('')
  const similarRooms = mockRooms.filter(item => item.id !== room.id).slice(0, 4)
  const mapHomes = [{ id: room.id, title: room.title, district: room.district, price: room.price, lat: -16.394, lng: -71.542 }]

  function shareListing() {
    if (navigator.share) navigator.share({ title: room.title, text: 'Mira este alojamiento en Habitat', url: window.location.href })
    else setToast('Enlace de alojamiento copiado')
  }

  return <div className="min-h-screen bg-[#FEFDF8] text-[#18181B] lg:pb-0">
    <AppHeader />
    <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5">
        <nav className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#71717A]"><Link href="/buscar" className="hover:text-[#A16207]">Buscar</Link><span>/</span><span>Arequipa</span><span>/</span><span>{room.district.split(',')[0]}</span><span>/</span><strong className="max-w-56 truncate text-[#18181B]">{room.title}</strong></nav>
        <div className="flex gap-2"><button type="button" onClick={shareListing} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-[#D4D4D8] bg-white px-3 py-2 text-xs font-bold"><Share2 size={14} /> Compartir</button><button type="button" onClick={() => setSaved(!saved)} className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold ${saved ? 'border-[#FACC15] bg-[#FFF7CC]' : 'border-[#D4D4D8] bg-white'}`}><Heart size={14} className={saved ? 'fill-[#FACC15]' : ''} /> {saved ? 'Guardado' : 'Guardar'}</button></div>
      </div>

      <section className="mb-7"><div className="flex flex-wrap gap-2"><span className="inline-flex items-center gap-1.5 rounded-full border border-[#A7F3D0] bg-[#E8F5F1] px-3 py-1.5 text-xs font-black text-[#047857]"><ShieldCheck size={14} /> Verificado presencialmente</span><span className="rounded-full border border-[#A7F3D0] bg-[#E8F5F1] px-3 py-1.5 text-xs font-bold text-[#047857]">Disponible ahora</span><span className="rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-1.5 text-xs font-bold text-[#1D4ED8]">A 8 min a pie de la UCSM</span></div><div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-[42px]">{room.title}</h1><p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#52525B]"><MapPin size={16} className="text-[#D97706]" /> Calle Cortaderas 214, {room.district} <span className="text-[#D4D4D8]">•</span> {room.distance} <a href="#mapa-ubicacion" className="font-black text-[#A16207] underline">Ver en mapa</a></p></div><div className="flex items-center gap-2 rounded-xl border border-[#FDE68A] bg-[#FFF7CC] px-3 py-2"><Star size={17} className="fill-[#F59E0B] text-[#F59E0B]" /><strong>4.92</strong><span className="text-xs text-[#71717A]">(18 reseñas)</span></div></div></section>

      <section aria-label="Galería de imágenes" className="relative mb-9 overflow-hidden rounded-2xl"><div className="grid h-[300px] gap-2 sm:h-[420px] md:h-[500px] md:grid-cols-4 md:grid-rows-2"><div className="relative overflow-hidden md:col-span-2 md:row-span-2"><img src={detailImages[0]} alt="Habitación principal amoblada" className="size-full object-cover transition duration-500 hover:scale-105" /></div><div className="relative hidden overflow-hidden md:block"><img src={detailImages[1]} alt="Zona de estudio" className="size-full object-cover transition duration-500 hover:scale-105" /></div><div className="relative hidden overflow-hidden md:block"><img src={detailImages[2]} alt="Baño privado" className="size-full object-cover transition duration-500 hover:scale-105" /></div><div className="relative hidden overflow-hidden md:block"><img src={detailImages[3]} alt="Cocina equipada" className="size-full object-cover transition duration-500 hover:scale-105" /></div><div className="relative hidden overflow-hidden md:block"><img src={detailImages[4]} alt="Ambiente compartido" className="size-full object-cover brightness-75 transition duration-500 hover:scale-105" /><span className="absolute inset-0 grid place-items-center text-lg font-black text-white">+ 6 fotos</span></div></div><button type="button" className="absolute bottom-4 right-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#E4E4E7] bg-white/95 px-4 py-2.5 text-xs font-black shadow-lg"><span>▦</span> Mostrar todas las fotos</button></section>

      <div className="grid items-start gap-9 lg:grid-cols-12"><div className="space-y-7 lg:col-span-8">
        <section className="grid grid-cols-2 gap-3 rounded-2xl border border-[#E4E4E7] bg-white p-4 shadow-sm sm:grid-cols-4"><KeySpec label="Tipo de espacio" value={room.type} detail="Uso exclusivo" /><KeySpec label="Baño" value="Privado" detail="Dentro del cuarto" /><KeySpec label="Equipamiento" value="100% amoblado" detail="Cama + escritorio" /><KeySpec label="Contrato mín." value="4 meses" detail="1 ciclo universitario" /></section>
        <section className="rounded-2xl border border-[#E4E4E7] bg-white p-5 shadow-sm sm:p-7"><SectionTitle title="Lo que incluye este alojamiento" badge="Servicios al 100%" /><div className="grid gap-5 sm:grid-cols-2">{amenities.map(([title, text, Icon]) => <div key={title} className="flex items-start gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#FDE68A] bg-[#FFF7CC] text-[#D97706]"><Icon size={19} /></div><div><h3 className="text-sm font-black">{title}</h3><p className="mt-1 text-xs leading-5 text-[#71717A]">{text}</p></div></div>)}</div><div className="mt-6 flex items-start gap-3 rounded-xl border border-[#A7F3D0] bg-[#E8F5F1] p-4"><div className="grid size-8 shrink-0 place-items-center rounded-full bg-[#10B981] text-white"><Check size={17} /></div><div><h3 className="text-sm font-black">Alojamiento auditado por Habitat Perú</h3><p className="mt-1 text-xs leading-5 text-[#52525B]">Visitamos este inmueble, validamos las fotos, servicios y ubicación para que decidas con confianza.</p></div></div></section>
        <section className="rounded-2xl border border-[#E4E4E7] bg-white p-5 shadow-sm sm:p-7"><h2 className="text-xl font-black">Descripción del espacio</h2><p className="mt-4 text-sm leading-7 text-[#52525B]">{room.description} Cuenta con excelente iluminación, un ambiente tranquilo para estudiar y acceso a áreas comunes ordenadas. Es una opción pensada para estudiantes que buscan independencia y cercanía al campus.</p><p className="mt-4 text-sm leading-7 text-[#52525B]">La convivencia prioriza el respeto, la seguridad y la claridad de condiciones desde el primer contacto con el propietario.</p><ul className="mt-5 grid gap-2 text-xs font-bold text-[#52525B] sm:grid-cols-2"><li>• Ambiente sereno y seguro</li><li>• Acceso con llave propia</li><li>• Áreas comunes ordenadas</li><li>• Distancia real verificada</li></ul></section>
        <section id="mapa-ubicacion" className="rounded-2xl border border-[#E4E4E7] bg-white p-5 shadow-sm sm:p-7"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-black">Ubicación y distancias clave</h2><p className="mt-1 text-xs text-[#71717A]">Zona residencial tranquila con acceso rápido a tu campus.</p></div><a href="https://maps.google.com" target="_blank" rel="noreferrer" className="rounded-lg border border-[#FDE68A] bg-[#FFF7CC] px-3 py-2 text-xs font-black text-[#A16207]">Abrir en Google Maps</a></div><div className="mt-5"><HabitatMap homes={mapHomes} className="h-[300px] sm:h-[360px]" /></div><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{[['A pie a UCSM', '8 min'], ['En bicicleta', '3 min'], ['UNSA Ingenierías', '14 min'], ['Supermercado', '5 min'], ['Farmacias', '2 min'], ['Plaza Yanahuara', '6 min']].map(([label, value]) => <div key={label} className="rounded-xl border border-[#F0F0F1] bg-[#F4F2EB] p-3"><span className="block text-[11px] text-[#71717A]">{label}</span><strong className="mt-1 block text-sm">{value}</strong></div>)}</div></section>
        <section className="rounded-2xl border border-[#E4E4E7] bg-white p-5 shadow-sm sm:p-7"><h2 className="text-xl font-black">Reglas de la casa y convivencia</h2><div className="mt-4 space-y-3">{rules.map(([title, text]) => <div key={title} className="flex items-start gap-3 rounded-xl bg-[#F4F2EB] p-3 text-sm"><span className="mt-1 size-2 shrink-0 rounded-full bg-[#FACC15]" /><p><strong>{title}:</strong> <span className="text-[#71717A]">{text}</span></p></div>)}</div></section>
        <section className="rounded-2xl border border-[#E4E4E7] bg-white p-5 shadow-sm sm:p-7"><div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-black">Reseñas de estudiantes anteriores</h2><p className="mt-1 text-xs text-[#71717A]">Experiencias de estudiantes que vivieron en Habitat.</p></div><div className="text-right"><strong className="text-3xl font-black">4.9</strong><span className="block text-xs text-[#71717A]">de 5 estrellas</span></div></div><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{['Limpieza', 'Velocidad WiFi', 'Ubicación', 'Trato'].map((item, index) => <div key={item}><p className="text-xs text-[#71717A]">{item}</p><div className="mt-2 h-1.5 rounded-full bg-[#F4F2EB]"><div className="h-full rounded-full bg-[#FACC15]" style={{ width: `${96 + index}%` }} /></div><p className="mt-1 text-right text-xs font-black">{index === 1 ? '4.9' : '5.0'}</p></div>)}</div><Review initials="DR" name="Diego Rodríguez" text="Excelente cuarto. Llegaba caminando al campus en menos de 10 minutos y el internet fue perfecto durante mis parciales." /><Review initials="CV" name="Camila Valdivia" text="El baño privado está impecable y la zona en Yanahuara se siente muy segura." /></section>
      </div>

      <aside className="lg:col-span-4"><div className="space-y-5 lg:sticky lg:top-24"><section className="rounded-2xl border border-[#E4E4E7] bg-white p-5 shadow-lg sm:p-6"><div className="flex items-end justify-between border-b border-[#F0F0F1] pb-4"><div><span className="text-3xl font-black">S/ {room.price}</span><span className="text-sm text-[#71717A]"> / mes</span></div><span className="rounded-lg bg-[#FFF7CC] px-2.5 py-1 text-[11px] font-black">Todo incluido</span></div><div className="flex flex-wrap gap-2 border-b border-[#F0F0F1] py-3 text-xs font-semibold text-[#52525B]"><span className="text-[#047857]">✓ Sin comisión</span><span>• Luz</span><span>• Agua</span><span>• WiFi</span></div><div className="my-5 space-y-3"><label className="grid gap-1 text-xs font-black">Fecha estimada de llegada<input type="date" className="field" defaultValue="2024-10-15" /></label><label className="grid gap-1 text-xs font-black">Estadía académica<select className="field"><option>1 ciclo académico (4 - 5 meses)</option><option>1 año académico</option></select></label></div><button type="button" onClick={() => setVisitOpen(true)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FACC15] px-4 py-3 text-sm font-black shadow-sm transition hover:bg-[#EAB308]"><CalendarDays size={17} /> Solicitar visita presencial o virtual</button><a href="https://wa.me/51954123456" target="_blank" rel="noreferrer" className="mt-2 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#18181B] px-4 py-3 text-sm font-black text-white"><MessageCircle size={17} className="text-[#10B981]" /> Contactar al propietario</a><p className="mt-4 flex items-center justify-center gap-1 text-center text-[11px] text-[#A1A1AA]"><ShieldCheck size={14} className="text-[#10B981]" /> Contacto directo verificado</p></section><section className="rounded-2xl border border-[#E4E4E7] bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><div className="grid size-12 place-items-center rounded-full bg-[#FACC15] font-black">CM</div><div><h2 className="font-black">Carlos M.</h2><p className="text-xs text-[#71717A]">Propietario verificado Habitat</p></div></div><div className="mt-4 flex justify-between border-t border-[#F0F0F1] pt-3 text-xs text-[#71717A]"><span>Responde en <strong className="text-[#18181B]">&lt; 15 min</strong></span><span className="font-black text-[#A16207]">★ 4.9</span></div></section><section className="rounded-2xl border border-[#E4E4E7] bg-white p-5 shadow-sm"><p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#71717A]">Universidad más cercana</p><div className="mt-3 flex items-center gap-3 rounded-xl bg-[#F4F2EB] p-3"><div className="grid size-10 place-items-center rounded-lg bg-[#FFF7CC] text-[#A16207]">▦</div><div><h2 className="text-sm font-black">UCSM Campus Central</h2><p className="text-xs text-[#71717A]">1.2 km · 8 min caminando</p></div></div></section></div></aside>
      </div>

      <section className="mt-14 border-t border-[#E4E4E7] pt-9"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-black">Alojamientos similares cerca de UCSM</h2><p className="mt-1 text-sm text-[#71717A]">Opciones verificadas en Yanahuara y Cayma.</p></div><Link href="/buscar" className="inline-flex items-center gap-1 text-sm font-black text-[#A16207]">Ver todos <ArrowRight size={16} /></Link></div><div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{similarRooms.map(item => <Link key={item.id} href={`/alojamiento/${item.id}`} className="group overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white shadow-sm"><div className="relative h-44 overflow-hidden"><img src={item.image} alt={item.title} className="size-full object-cover transition duration-300 group-hover:scale-105" /><span className="absolute left-3 top-3 rounded-md bg-white/95 px-2 py-1 text-[10px] font-black text-[#047857]">✓ Verificado</span></div><div className="p-4"><h3 className="truncate text-sm font-black">{item.title}</h3><p className="mt-1 text-xs text-[#71717A]">{item.district} · {item.distance}</p><p className="mt-4 border-t border-[#F0F0F1] pt-3 text-base font-black">S/ {item.price} <span className="text-xs font-normal text-[#71717A]">/ mes</span></p></div></Link>)}</div></section>
    </main>
    <Footer />
    <VisitRequestModal open={visitOpen} onClose={() => setVisitOpen(false)} onSubmitted={() => { setVisitOpen(false); setToast('Solicitud de visita enviada') }} />
    {toast && <Toast onClose={() => setToast('')}>{toast}</Toast>}
  </div>
}

function KeySpec({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="rounded-xl border border-[#F0F0F1] bg-[#F4F2EB] p-3"><p className="text-[10px] font-black uppercase tracking-[0.08em] text-[#71717A]">{label}</p><p className="mt-1 text-sm font-black">{value}</p><p className="mt-1 text-[11px] text-[#A16207]">{detail}</p></div>
}

function SectionTitle({ title, badge }: { title: string; badge: string }) {
  return <div className="mb-5 flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-black">{title}</h2><span className="rounded-full bg-[#E8F5F1] px-2.5 py-1 text-[11px] font-black text-[#047857]">{badge}</span></div>
}

function Review({ initials, name, text }: { initials: string; name: string; text: string }) {
  return <div className="mt-4 rounded-xl border border-[#F0F0F1] bg-[#F4F2EB] p-4"><div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-full bg-[#18181B] text-xs font-black text-white">{initials}</div><div><h3 className="text-xs font-black">{name}</h3><p className="text-[11px] text-[#71717A]">Estudiante verificado · Vivió 6 meses</p></div></div><p className="mt-3 text-xs leading-6 text-[#52525B]">“{text}”</p></div>
}
