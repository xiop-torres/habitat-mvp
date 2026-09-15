'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  CalendarCheck2,
  CheckCircle2,
  ChevronRight,
  Download,
  Edit3,
  Eye,
  Home,
  MessageCircle,
  PauseCircle,
  PlusCircle,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react'
import { AppHeader, Footer } from '@/components/Shared'
import { cn } from '@/lib/utils'
import { mockConversations, mockRequests, mockRooms } from '@/lib/mocks'

const listingStats = [
  { views: 620, requests: 8, visits: 3 },
  { views: 480, requests: 5, visits: 2 },
  { views: 320, requests: 4, visits: 1 },
  { views: 110, requests: 1, visits: 0 },
]

export default function OwnerDashboard() {
  const [tab, setTab] = useState('todos')
  const [paused, setPaused] = useState<Record<number, boolean>>({ 4: true })
  const [accepted, setAccepted] = useState<number[]>([])

  const ownerListings = useMemo(() => mockRooms.map((room, index) => ({
    ...room,
    stats: listingStats[index],
    isPaused: paused[room.id as number],
  })), [paused])

  const visibleListings = ownerListings.filter(room => {
    if (tab === 'activos') return !room.isPaused
    if (tab === 'pausados') return room.isPaused
    return true
  })

  return (
    <div className="min-h-screen bg-secondary/30 text-foreground">
      <AppHeader owner />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Link href="/" className="hover:text-foreground">Inicio</Link>
              <ChevronRight size={13} />
              <span className="text-foreground">Panel de Propietario</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight">Panel del Propietario</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                <ShieldCheck size={15} /> Anfitrión verificado Habitat Arequipa
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Gestiona tus inmuebles, atiende consultas de universitarios validados y programa visitas presenciales seguras en Yanahuara y Cayma.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/propietario/solicitudes" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold transition hover:bg-secondary">
              <CalendarCheck2 size={17} /> Solicitudes de visita <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-black">4 pendientes</span>
            </Link>
            <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-card px-4 py-2 text-sm font-bold transition hover:bg-secondary">
              <Download size={17} /> Reporte del mes
            </button>
            <Link href="/propietario/nuevo" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-black shadow-sm transition hover:bg-primary/80">
              <PlusCircle size={17} /> Publicar nuevo alojamiento
            </Link>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-primary/40 bg-primary/25 p-5 md:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary">
                <CalendarCheck2 size={23} />
              </span>
              <div>
                <h2 className="text-xl font-black">Tienes 2 visitas agendadas para este sábado 19 de Octubre cerca de la UCSM</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Recuerda confirmar tu disponibilidad con los estudiantes universitarios con al menos 2 horas de anticipación.</p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link href="/propietario/solicitudes" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-card px-4 py-2 text-sm font-bold">
                <CalendarCheck2 size={16} /> 4 pendientes
              </Link>
              <Link href="/propietario/calendario" className="inline-flex min-h-10 items-center rounded-xl bg-primary px-4 py-2 text-sm font-black">Ver agenda de visitas</Link>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Alojamientos activos', value: '3', sub: '/ 4 en total', tag: '100% ocupabilidad', icon: Home, progress: 75 },
            { label: 'Visitas pendientes', value: '4', sub: '2 estudiantes de UCSM y 2 de UNSA', tag: 'Por confirmar hoy', icon: CalendarCheck2 },
            { label: 'Mensajes nuevos', value: '2', sub: 'Tiempo promedio de rpta: 14 min', tag: 'Activos', icon: MessageCircle },
            { label: 'Visualizaciones (mes)', value: '1,420', sub: 'Crecimiento frente al mes anterior', tag: '+18%', icon: Eye, trend: true },
          ].map(item => {
            const Icon = item.icon
            return (
              <article key={item.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-muted-foreground">{item.label}</p>
                  <span className="grid size-9 place-items-center rounded-xl bg-secondary"><Icon size={18} className="text-primary" /></span>
                </div>
                <div className="mt-5 flex items-end justify-between gap-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black">{item.value}</span>
                    {!item.trend && <span className="text-sm text-muted-foreground">{item.sub}</span>}
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-black text-emerald-700">{item.tag}</span>
                </div>
                {item.progress && <div className="mt-5 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${item.progress}%` }} /></div>}
                {item.trend && <div className="mt-5 flex h-7 items-end gap-1 text-primary">{[35, 38, 36, 40, 52, 61, 54, 72].map((height, index) => <span key={index} className="w-full rounded-t bg-primary/70" style={{ height: `${height}%` }} />)}</div>}
                {!item.progress && !item.trend && <p className="mt-5 text-sm text-muted-foreground">{item.sub}</p>}
              </article>
            )
          })}
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
          <section className="space-y-5">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="inline-flex w-fit rounded-xl bg-secondary p-1">
                  {[
                    ['todos', 'Todos (4)'],
                    ['activos', 'Activos (3)'],
                    ['pausados', 'Pausados (1)'],
                  ].map(([key, label]) => (
                    <button key={key} type="button" onClick={() => setTab(key)} className={cn('min-h-9 rounded-lg px-4 text-sm font-black transition', tab === key ? 'bg-primary shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <label className="relative min-w-0 flex-1 sm:w-72">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input className="field h-10 rounded-xl bg-secondary pl-9 text-sm" placeholder="Filtrar por distrito..." />
                  </label>
                  <button type="button" aria-label="Ordenar alojamientos" className="grid size-10 place-items-center rounded-xl bg-secondary hover:bg-primary/20">
                    <SlidersHorizontal size={17} />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {visibleListings.map(room => (
                <article key={room.id} className={cn('overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md sm:grid sm:grid-cols-[220px_1fr]', room.isPaused ? 'border-dashed border-border opacity-80' : 'border-border')}>
                  <div className={cn('relative h-56 bg-secondary sm:h-auto', room.isPaused && 'grayscale')}>
                    <img src={room.image} alt={room.title} className="h-full w-full object-cover" />
                    <span className={cn('absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black', room.isPaused ? 'bg-secondary text-muted-foreground' : 'bg-emerald-100 text-emerald-700')}>
                      {room.isPaused ? <PauseCircle size={13} /> : <ShieldCheck size={13} />}
                      {room.isPaused ? 'Pausado' : 'Verificado'}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-col gap-4 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className={cn('inline-flex items-center gap-2 text-sm font-black', room.isPaused ? 'text-muted-foreground' : 'text-emerald-700')}>
                          <span className={cn('size-2 rounded-full', room.isPaused ? 'bg-muted-foreground' : 'bg-emerald-600')} />
                          {room.isPaused ? 'En mantenimiento / renovación temporal' : 'Activo y visible en búsquedas'}
                        </p>
                        <h2 className="mt-2 text-xl font-black">{room.title}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">{room.district} · {room.distance}</p>
                      </div>
                      <p className="shrink-0 text-xl font-black">S/ {room.price} <span className="text-sm font-normal text-muted-foreground">/ mes</span></p>
                    </div>

                    {!room.isPaused ? (
                      <div className="grid grid-cols-3 gap-2 rounded-xl bg-secondary p-3">
                        <Stat label="Vistas" value={room.stats.views} />
                        <Stat label="Solicitudes" value={room.stats.requests} highlight />
                        <Stat label="Visitas hechas" value={room.stats.visits} />
                      </div>
                    ) : (
                      <p className="rounded-xl bg-secondary p-3 text-sm leading-6 text-muted-foreground">Este anuncio no es visible para estudiantes actualmente. Puedes reactivarlo cuando esté disponible para el ciclo universitario 2025-I.</p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => setPaused(current => ({ ...current, [room.id as number]: !current[room.id as number] }))} className={cn('inline-flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-sm font-black', room.isPaused ? 'bg-secondary hover:bg-primary/20' : 'bg-primary')}>
                          {room.isPaused ? <CheckCircle2 size={16} /> : <span className="size-2 rounded-full bg-emerald-600" />}
                          {room.isPaused ? 'Activar' : 'Activo'}
                        </button>
                        <button type="button" onClick={() => setPaused(current => ({ ...current, [room.id as number]: true }))} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm font-bold hover:bg-primary/20">
                          <PauseCircle size={16} /> Pausar
                        </button>
                        <Link href={`/propietario/editar/${room.id}`} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm font-bold hover:bg-primary/20">
                          <Edit3 size={16} /> Editar
                        </Link>
                        <Link href="/propietario/calendario" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm font-bold hover:bg-primary/20">
                          <CalendarCheck2 size={16} /> Calendario
                        </Link>
                      </div>
                      <Link href={`/alojamiento/${room.id}`} className="inline-flex items-center gap-1 text-sm font-black hover:underline">Ver ficha pública <ArrowUpRight size={15} /></Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <section id="solicitudes-section" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid size-9 place-items-center rounded-xl bg-primary/25"><CalendarCheck2 size={18} /></span>
                  <h2 className="text-xl font-black">Solicitudes de Visita</h2>
                </div>
                <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-black">2 nuevas</span>
              </div>
              <div className="mt-5 space-y-4">
                {mockRequests.map((request, index) => (
                  <article key={request.id} className={cn('rounded-2xl bg-secondary p-4', index === 0 && 'border-l-4 border-primary')}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={cn('grid size-11 place-items-center rounded-full text-sm font-black', index === 0 ? 'bg-primary' : 'bg-emerald-100 text-emerald-700')}>{request.initials}</span>
                        <div>
                          <p className="font-black">{request.name} <ShieldCheck className="inline size-4 text-emerald-600" /></p>
                          <p className="text-xs font-semibold text-muted-foreground">{index === 0 ? 'Medicina Humana · UCSM' : 'Ing. Industrial · UNSA'}</p>
                        </div>
                      </div>
                      <span className="rounded-lg bg-card px-2 py-1 text-[11px] font-bold text-muted-foreground">{index === 0 ? 'Sábado 19' : 'Lunes 21'}</span>
                    </div>
                    <div className="mt-3 rounded-xl bg-card p-3 text-sm">
                      <p className="font-bold">{request.date} · {request.shift.split('·')[0].trim()}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{request.room.title}</p>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={() => setAccepted(ids => [...ids, request.id])} disabled={accepted.includes(request.id)} className="min-h-10 flex-1 rounded-xl bg-primary px-3 py-2 text-sm font-black disabled:bg-emerald-100 disabled:text-emerald-700">
                        {accepted.includes(request.id) ? 'Visita aceptada' : 'Aceptar visita'}
                      </button>
                      <button type="button" className="min-h-10 rounded-xl bg-card px-3 py-2 text-sm font-bold hover:bg-primary/20">{index === 0 ? 'Reprogramar' : 'Rechazar'}</button>
                      {index === 0 && <Link href="/mensajes" aria-label="Conversar" className="grid size-10 place-items-center rounded-xl bg-card hover:bg-primary/20"><MessageCircle size={17} /></Link>}
                    </div>
                  </article>
                ))}
              </div>
              <Link href="/propietario/solicitudes" className="mt-4 inline-flex w-full justify-center text-sm font-black hover:underline">Ver todas las solicitudes históricas (18)</Link>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid size-9 place-items-center rounded-xl bg-primary/25"><MessageCircle size={18} /></span>
                  <h2 className="text-xl font-black">Mensajes Recientes</h2>
                </div>
                <Link href="/mensajes" className="text-sm font-black hover:underline">Ir a chat</Link>
              </div>
              <div className="mt-5 space-y-3">
                {mockConversations.map((conversation, index) => (
                  <Link key={conversation.id} href="/mensajes" className="flex gap-3 rounded-xl p-2 transition hover:bg-secondary">
                    <span className={cn('grid size-10 shrink-0 place-items-center rounded-full text-sm font-black', index === 0 ? 'bg-primary' : 'bg-emerald-100 text-emerald-700')}>{conversation.initials}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-black">{conversation.name}</span>
                        <span className="shrink-0 text-[11px] text-muted-foreground">{index === 0 ? 'Hace 15 min' : 'Hace 2 horas'}</span>
                      </span>
                      <span className="block truncate text-sm text-muted-foreground">{conversation.preview}</span>
                      <span className="mt-1 inline-flex text-xs font-black">Responder en chat →</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-xl bg-primary/25"><ShieldCheck size={18} /></span>
                <h2 className="text-xl font-black">Comunidad Universitaria Directa</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Conectas directamente con estudiantes de la UCSM, UNSA y San Pablo sin intermediarios ni comisiones sorpresa.</p>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-secondary p-3 text-sm font-bold">
                <CheckCircle2 size={18} className="text-emerald-600" /> Trato 100% directo y sin comisiones de alquiler
              </div>
            </section>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function Stat({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-muted-foreground">{label}</p>
      <p className={cn('mt-0.5 text-sm font-black', highlight && 'text-primary')}>{value}</p>
    </div>
  )
}
