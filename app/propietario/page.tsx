'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowUpRight,
  CalendarCheck2,
  CheckCircle2,
  ChevronRight,
  Download,
  Edit3,
  Eye,
  Home,
  Loader2,
  MessageCircle,
  PauseCircle,
  PlusCircle,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react'
import { AppHeader, Footer } from '@/components/Shared'
import { cn } from '@/lib/utils'
import { mockConversations, mockRequests } from '@/lib/mocks'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Listing } from '@/lib/supabase/listings'

// Estadísticas demo por listing (todavía no provienen de Supabase — se implementarán en 4D/4E)
const DEMO_STATS = { views: 0, requests: 0, visits: 0 }

export default function OwnerDashboard() {
  const router = useRouter()

  // Auth state
  const [authChecked, setAuthChecked] = useState(false)

  // Listings reales de Supabase
  const [listings, setListings] = useState<Listing[]>([])
  const [loadingListings, setLoadingListings] = useState(true)
  const [updating, setUpdating] = useState<Record<string, boolean>>({})

  // UI state
  const [tab, setTab] = useState('todos')
  const [accepted, setAccepted] = useState<number[]>([])

  useEffect(() => {
    async function init() {
      const supabase = createSupabaseBrowserClient()

      // Verificar sesión y rol
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.role !== 'owner') {
        router.replace('/buscar')
        return
      }

      setAuthChecked(true)

      // Cargar listings reales del owner autenticado (RLS garantiza aislamiento)
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setListings(data as Listing[])
      }

      setLoadingListings(false)
    }

    init()
  }, [router])

  async function handleToggleStatus(listingId: string, currentStatus: string) {
    if (updating[listingId]) return

    const newStatus = currentStatus === 'published' ? 'paused' : 'published'
    
    setUpdating((prev) => ({ ...prev, [listingId]: true }))

    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase
      .from('listings')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', listingId)

    if (error) {
      alert('Hubo un error al actualizar el estado. Inténtalo nuevamente.')
    } else {
      // Actualizar el estado local para reflejar el cambio en la UI
      setListings((current) =>
        current.map((l) => (l.id === listingId ? { ...l, status: newStatus } : l))
      )
    }

    setUpdating((prev) => ({ ...prev, [listingId]: false }))
  }

  const visibleListings = listings.filter((l) => {
    if (tab === 'activos') return l.status === 'published'
    if (tab === 'pausados') return l.status === 'paused'
    return true
  })

  const activeCount = listings.filter((l) => l.status === 'published').length
  const pausedCount = listings.filter((l) => l.status === 'paused').length
  const totalCount = listings.length

  // Loading / auth guard
  if (!authChecked || loadingListings) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    )
  }

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
              Gestiona tus inmuebles, atiende consultas de universitarios validados y programa visitas presenciales seguras.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/propietario/solicitudes" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold transition hover:bg-secondary">
              <CalendarCheck2 size={17} /> Solicitudes de visita{' '}
              <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-black">4 pendientes</span>
            </Link>
            <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-card px-4 py-2 text-sm font-bold transition hover:bg-secondary">
              <Download size={17} /> Reporte del mes
            </button>
            <Link href="/propietario/nuevo" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-black shadow-sm transition hover:bg-primary/80">
              <PlusCircle size={17} /> Publicar nuevo alojamiento
            </Link>
          </div>
        </section>

        {/* Stats cards */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Alojamientos activos', value: String(activeCount), sub: `/ ${totalCount} en total`, tag: 'Total real', icon: Home, progress: totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0 },
            { label: 'Visitas pendientes', value: '—', sub: 'Disponible próximamente', tag: 'Demo', icon: CalendarCheck2 },
            { label: 'Mensajes nuevos', value: '—', sub: 'Disponible próximamente', tag: 'Demo', icon: MessageCircle },
            { label: 'Visualizaciones (mes)', value: '—', sub: 'Disponible próximamente', tag: 'Demo', icon: Eye },
          ].map((item) => {
            const Icon = item.icon
            return (
              <article key={item.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-muted-foreground">{item.label}</p>
                  <span className="grid size-9 place-items-center rounded-xl bg-secondary">
                    <Icon size={18} className="text-primary" />
                  </span>
                </div>
                <div className="mt-5 flex items-end justify-between gap-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black">{item.value}</span>
                    <span className="text-sm text-muted-foreground">{item.sub}</span>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-black text-emerald-700">{item.tag}</span>
                </div>
                {item.progress !== undefined && item.progress > 0 && (
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-emerald-600" style={{ width: `${item.progress}%` }} />
                  </div>
                )}
              </article>
            )
          })}
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
          {/* Listings reales */}
          <section className="space-y-5">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="inline-flex w-fit rounded-xl bg-secondary p-1">
                  {[
                    ['todos', `Todos (${totalCount})`],
                    ['activos', `Activos (${activeCount})`],
                    ['pausados', `Pausados (${pausedCount})`],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTab(key)}
                      className={cn(
                        'min-h-9 rounded-lg px-4 text-sm font-black transition',
                        tab === key ? 'bg-primary shadow-sm' : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
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

            {/* Estado vacío */}
            {visibleListings.length === 0 && (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                <span className="grid size-14 place-items-center rounded-full bg-secondary">
                  <Home size={26} className="text-muted-foreground" />
                </span>
                <div>
                  <p className="font-black">
                    {tab === 'todos'
                      ? 'Aún no tienes alojamientos publicados'
                      : tab === 'activos'
                        ? 'No tienes alojamientos activos'
                        : 'No tienes alojamientos pausados'}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {tab === 'todos'
                      ? 'Publica tu primer espacio y conecta con estudiantes universitarios.'
                      : 'Cambia el filtro para ver otros alojamientos.'}
                  </p>
                </div>
                {tab === 'todos' && (
                  <Link
                    href="/propietario/nuevo"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-black"
                  >
                    <PlusCircle size={17} /> Publicar nuevo alojamiento
                  </Link>
                )}
              </div>
            )}

            <div className="space-y-5">
              {visibleListings.map((listing) => {
                const isPaused = listing.status === 'paused'
                const isUpdating = updating[listing.id]

                return (
                  <article
                    key={listing.id}
                    className={cn(
                      'overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md sm:grid sm:grid-cols-[220px_1fr]',
                      isPaused ? 'border-dashed border-border opacity-80' : 'border-border',
                    )}
                  >
                    {/* Imagen placeholder hasta que se implemente Storage */}
                    <div className={cn('relative h-56 bg-secondary sm:h-auto', isPaused && 'grayscale')}>
                      <img src="/habitat-room.png" alt={listing.title} className="h-full w-full object-cover" />
                      <span
                        className={cn(
                          'absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black',
                          isPaused ? 'bg-secondary text-muted-foreground' : 'bg-emerald-100 text-emerald-700',
                        )}
                      >
                        {isPaused ? <PauseCircle size={13} /> : <ShieldCheck size={13} />}
                        {isPaused ? 'Pausado' : listing.verified ? 'Verificado' : 'Publicado'}
                      </span>
                    </div>

                    <div className="flex min-w-0 flex-col gap-4 p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className={cn('inline-flex items-center gap-2 text-sm font-black', isPaused ? 'text-muted-foreground' : 'text-emerald-700')}>
                            <span className={cn('size-2 rounded-full', isPaused ? 'bg-muted-foreground' : 'bg-emerald-600')} />
                            {isPaused ? 'Pausado' : 'Activo y visible en búsquedas'}
                          </p>
                          <h2 className="mt-2 text-xl font-black">{listing.title}</h2>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {listing.district}, Arequipa
                            {listing.university_nearby && ` · Cerca de ${listing.university_nearby}`}
                          </p>
                        </div>
                        <p className="shrink-0 text-xl font-black">
                          S/ {listing.price_monthly.toFixed(0)}{' '}
                          <span className="text-sm font-normal text-muted-foreground">/ mes</span>
                        </p>
                      </div>

                      {/* Stats */}
                      {!isPaused ? (
                        <div className="grid grid-cols-3 gap-2 rounded-xl bg-secondary p-3">
                          <Stat label="Vistas" value={DEMO_STATS.views} />
                          <Stat label="Solicitudes" value={DEMO_STATS.requests} highlight />
                          <Stat label="Visitas hechas" value={DEMO_STATS.visits} />
                        </div>
                      ) : (
                        <p className="rounded-xl bg-secondary p-3 text-sm leading-6 text-muted-foreground">
                          Este anuncio no es visible para estudiantes actualmente.
                        </p>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleToggleStatus(listing.id, listing.status)}
                            className={cn(
                              'inline-flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-sm font-black disabled:opacity-50 transition',
                              isPaused ? 'bg-secondary hover:bg-primary/20' : 'bg-primary hover:bg-primary/80',
                            )}
                          >
                            {isUpdating ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : isPaused ? (
                              <CheckCircle2 size={16} />
                            ) : (
                              <span className="size-2 rounded-full bg-emerald-600" />
                            )}
                            {isUpdating ? 'Procesando...' : isPaused ? 'Activar anuncio' : 'Anuncio activo'}
                          </button>
                          {!isPaused && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleToggleStatus(listing.id, listing.status)}
                              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm font-bold hover:bg-primary/20 disabled:opacity-50 transition"
                            >
                              <PauseCircle size={16} /> Pausar
                            </button>
                          )}
                          <Link
                            href={`/propietario/editar/${listing.id}`}
                            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm font-bold hover:bg-primary/20 transition"
                          >
                            <Edit3 size={16} /> Editar
                          </Link>
                          <Link
                            href="/propietario/calendario"
                            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm font-bold hover:bg-primary/20 transition"
                          >
                            <CalendarCheck2 size={16} /> Calendario
                          </Link>
                        </div>
                        <Link href={`/alojamiento/${listing.id}`} className="inline-flex items-center gap-1 text-sm font-black hover:underline">
                          Ver ficha pública <ArrowUpRight size={15} />
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          {/* Sidebar */}
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
                      <button
                        type="button"
                        onClick={() => setAccepted((ids) => [...ids, request.id])}
                        disabled={accepted.includes(request.id)}
                        className="min-h-10 flex-1 rounded-xl bg-primary px-3 py-2 text-sm font-black disabled:bg-emerald-100 disabled:text-emerald-700"
                      >
                        {accepted.includes(request.id) ? 'Visita aceptada' : 'Aceptar visita'}
                      </button>
                      <button type="button" className="min-h-10 rounded-xl bg-card px-3 py-2 text-sm font-bold hover:bg-primary/20">
                        {index === 0 ? 'Reprogramar' : 'Rechazar'}
                      </button>
                      {index === 0 && (
                        <Link href="/mensajes" aria-label="Conversar" className="grid size-10 place-items-center rounded-xl bg-card hover:bg-primary/20">
                          <MessageCircle size={17} />
                        </Link>
                      )}
                    </div>
                  </article>
                ))}
              </div>
              <Link href="/propietario/solicitudes" className="mt-4 inline-flex w-full justify-center text-sm font-black hover:underline">
                Ver todas las solicitudes históricas
              </Link>
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
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Conectas directamente con estudiantes de la UCSM, UNSA y San Pablo sin intermediarios ni comisiones sorpresa.
              </p>
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
      <p className={cn('mt-0.5 text-sm font-black', highlight && 'text-primary')}>{value === 0 ? '—' : value}</p>
    </div>
  )
}
