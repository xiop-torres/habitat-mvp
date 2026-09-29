'use client'

import Link from 'next/link'
import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Footprints,
  MessageSquare,
  Search,
  ShieldCheck,
  UserRound,
  Video,
  X,
  Loader2,
  TriangleAlert,
} from 'lucide-react'
import { AppHeader, Footer, Toast } from '@/components/Shared'
import { getStudentVisits, updateVisitStatus, type VisitRequest, type VisitStatus } from '@/lib/supabase/visits'
import { useCurrentUserProfile } from '@/lib/supabase/useProfile'
import { getListingImageUrl } from '@/lib/supabase/storage'
import { cn } from '@/lib/utils'

type TabType = 'proximas' | 'historial' | 'todas'

const statusLabels: Record<VisitStatus, string> = {
  pending: 'Pendiente',
  accepted: 'Confirmada',
  rescheduled: 'Reprogramada',
  rejected: 'Rechazada',
  cancelled: 'Cancelada',
  completed: 'Completada',
}

const checklist = [
  ['Carné universitario', 'Llévalo contigo para validar tu matrícula estudiantil.', true],
  ['Test de WiFi y señal móvil', 'Prueba velocidad exacta en el escritorio de estudio.', true],
  ['Ducha y presión de agua', 'Comprueba terma eléctrica/solar y caudal en horarios punta.', false],
  ['Horarios y normas', 'Aclara llaves independientes, uso de cocina y visitas.', false],
  ['Cero adelantos informales', 'Paga con depósito de garantía respaldado en Habitat.', false],
] as const

export default function VisitsPage() {
  const router = useRouter()
  const { profile, loading: authLoading } = useCurrentUserProfile()
  
  const [visits, setVisits] = useState<VisitRequest[]>([])
  const [active, setActive] = useState<TabType>('proximas')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const [pendingCancel, setPendingCancel] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (profile?.role === 'owner') {
      router.replace('/propietario')
      return
    }
    if (profile?.role === 'student' || profile?.role === 'admin') {
      loadVisits()
    } else if (profile === null) {
      router.replace('/login')
    }
  }, [profile, authLoading])

  async function loadVisits() {
    setLoading(true)
    setError('')
    try {
      const data = await getStudentVisits()
      setVisits(data)
    } catch (err: any) {
      setError(err.message || 'Error al cargar tus visitas')
    } finally {
      setLoading(false)
    }
  }

  const counts = useMemo(() => {
    return {
      proximas: visits.filter(v => ['pending', 'accepted', 'rescheduled'].includes(v.status)).length,
      historial: visits.filter(v => ['rejected', 'cancelled', 'completed'].includes(v.status)).length,
      todas: visits.length
    }
  }, [visits])

  const visible = useMemo(() => {
    if (active === 'proximas') return visits.filter(v => ['pending', 'accepted', 'rescheduled'].includes(v.status))
    if (active === 'historial') return visits.filter(v => ['rejected', 'cancelled', 'completed'].includes(v.status))
    return visits
  }, [visits, active])

  async function confirmCancel() {
    if (!pendingCancel) return
    try {
      const { success, error: cancelError } = await updateVisitStatus(pendingCancel, 'cancelled')
      if (success) {
        setToast('Visita cancelada. El anfitrión fue notificado.')
        await loadVisits()
      } else {
        setToast(`Error: ${cancelError}`)
      }
    } catch {
      setToast('Ocurrió un error inesperado al cancelar.')
    } finally {
      setPendingCancel(null)
    }
  }

  if (authLoading || (profile?.role === 'owner')) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary size-12" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main>
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Link href="/buscar" className="flex items-center gap-1 hover:text-foreground">
                <UserRound size={14} /> Inicio
              </Link>
              <ChevronRight size={14} />
              <Link href="/perfil" className="hover:text-foreground">Mi cuenta</Link>
              <ChevronRight size={14} />
              <span className="text-foreground">Mis visitas</span>
            </nav>

            <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Mis Visitas Agendadas</h1>
                </div>
                <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-muted-foreground sm:text-base">
                  Gestiona y da seguimiento a tus solicitudes de visita a alojamientos.
                </p>
              </div>
              <Link href="/buscar" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold shadow-sm transition hover:bg-primary-hover">
                <Search size={17} /> Explorar más alojamientos
              </Link>
            </div>

            <div className="mt-8 flex flex-col gap-4 border-t border-border pt-4 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-2 overflow-x-auto">
                {[
                  { id: 'proximas', label: 'Próximas' },
                  { id: 'historial', label: 'Historial' },
                  { id: 'todas', label: 'Todas' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActive(tab.id as TabType)}
                    className={cn(
                      'inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold transition',
                      active === tab.id ? 'bg-primary text-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                    )}
                  >
                    {tab.label}
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-bold', active === tab.id ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground')}>
                      {counts[tab.id as TabType]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <section className="space-y-5 lg:col-span-8">
              {loading ? (
                <div className="rounded-2xl border border-border bg-card p-10 flex flex-col items-center justify-center shadow-sm">
                  <Loader2 size={40} className="animate-spin mb-4 text-primary" />
                  <p className="text-sm font-bold">Cargando tus visitas...</p>
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-border bg-card p-10 flex flex-col items-center justify-center shadow-sm text-destructive">
                  <TriangleAlert size={40} className="mb-4" />
                  <p className="text-sm font-bold">{error}</p>
                </div>
              ) : visible.length > 0 ? (
                visible.map(visit => {
                  const cover = visit.listing?.listing_images?.find((i: any) => i.is_cover) || visit.listing?.listing_images?.[0]
                  const imageUrl = cover ? getListingImageUrl(cover.storage_path) : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800'
                  
                  const isPublished = visit.listing?.status === 'published'
                  const titleNode = isPublished ? (
                    <Link href={`/alojamiento/${visit.listing.id}`} className="hover:underline">
                      {visit.listing?.title}
                    </Link>
                  ) : (
                    <span>{visit.listing?.title || 'Alojamiento no disponible'}</span>
                  )

                  const canCancel = visit.status === 'pending' || visit.status === 'accepted'

                  return (
                    <article key={visit.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md">
                      <div className={cn('flex items-center justify-between px-5 py-3 text-sm font-bold uppercase tracking-wide', visit.status === 'cancelled' ? 'bg-muted-foreground text-background' : 'bg-foreground text-background')}>
                        <span className="flex items-center gap-2">
                          {visit.status === 'cancelled' ? <X size={17} /> : <AlertCircle size={17} className="text-primary" />}
                          Estado: {statusLabels[visit.status]}
                        </span>
                      </div>
                      <div className="p-5 sm:p-6">
                        <div className="flex flex-col gap-6 md:flex-row">
                          <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-xl bg-secondary md:w-48">
                            {isPublished ? (
                              <Link href={`/alojamiento/${visit.listing.id}`}>
                                <img src={imageUrl} alt="" className="h-full w-full object-cover transition hover:scale-105" />
                              </Link>
                            ) : (
                              <img src={imageUrl} alt="" className="h-full w-full object-cover opacity-80 grayscale" />
                            )}
                            
                            {visit.listing?.district && (
                              <span className="absolute left-2 top-2 rounded-lg bg-card/95 px-2 py-1 text-xs font-bold shadow-sm">{visit.listing.district}</span>
                            )}
                            {visit.listing?.price_monthly && (
                              <span className="absolute bottom-2 left-2 rounded-lg bg-foreground/90 px-2.5 py-1 text-sm font-bold text-background">
                                S/ {visit.listing.price_monthly} <span className="text-xs font-medium text-background/70">/ mes</span>
                              </span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={cn(
                                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold', 
                                visit.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                                visit.status === 'rescheduled' ? 'bg-orange-100 text-orange-700' : 
                                visit.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                                'bg-emerald-100 text-emerald-700'
                              )}>
                                {visit.status === 'cancelled' ? <X size={13} /> : <CheckCircle2 size={13} />}
                                {statusLabels[visit.status]}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-bold text-muted-foreground">
                                {visit.mode === 'virtual' ? <Video size={13} /> : <Footprints size={13} />}
                                {visit.mode === 'virtual' ? 'Virtual' : 'Presencial'}
                              </span>
                              {!isPublished && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
                                  Pausado
                                </span>
                              )}
                            </div>

                            <h2 className="mt-3 text-xl font-bold">{titleNode}</h2>

                            <div className="mt-4 grid gap-3 rounded-xl border border-border bg-secondary/60 p-4 sm:grid-cols-2">
                              <div className="flex gap-3">
                                <Clock3 className="mt-0.5 size-5 text-foreground" />
                                <div>
                                  <p className="text-xs font-bold text-muted-foreground">Fecha y horario</p>
                                  <p className="mt-1 text-sm font-bold">{visit.requested_date} • {visit.requested_time}</p>
                                </div>
                              </div>
                            </div>
                            
                            {visit.message && (
                              <p className="mt-4 rounded-xl bg-primary/10 p-4 text-sm font-medium leading-6 text-foreground">
                                “{visit.message}”
                              </p>
                            )}

                            {visit.status === 'rescheduled' && (
                              <p className="mt-4 text-sm font-medium text-orange-700 bg-orange-50 p-3 rounded-xl border border-orange-200">
                                El propietario ha propuesto una nueva fecha y horario para esta visita.
                              </p>
                            )}

                            {['rejected', 'cancelled', 'completed'].includes(visit.status) ? (
                              <div className="mt-5 rounded-xl border border-border bg-secondary/70 p-4 text-sm text-muted-foreground text-center font-medium">
                                Esta solicitud ha finalizado.
                              </div>
                            ) : (
                              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                                <div className="flex flex-wrap gap-2">
                                  <Link href="/mensajes" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold hover:bg-primary-hover">
                                    <MessageSquare size={16} />
                                    Chat Seguro Habitat
                                  </Link>
                                </div>
                                {canCancel && (
                                  <div className="flex gap-3 text-sm font-bold">
                                    <button 
                                      type="button" 
                                      onClick={() => setPendingCancel(visit.id)} 
                                      className="text-red-600 hover:text-red-700 min-h-11 px-4 py-2 rounded-xl hover:bg-red-50 transition"
                                    >
                                      {visit.status === 'pending' ? 'Cancelar solicitud' : 'Cancelar visita'}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })
              ) : (
                <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
                  <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary text-foreground"><CalendarDays size={30} /></span>
                  <h2 className="mt-5 text-xl font-bold">No tienes visitas en esta sección</h2>
                  <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-muted-foreground">Explora habitaciones disponibles cerca de tu universidad y agenda tu próxima visita.</p>
                  <Link href="/buscar" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold hover:bg-primary-hover"><Search size={17} /> Explorar más alojamientos</Link>
                </div>
              )}
            </section>

            <aside className="space-y-5 lg:col-span-4">
              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary"><Check size={22} /></span>
                  <div>
                    <h2 className="text-lg font-bold">Checklist del Estudiante</h2>
                    <p className="text-xs font-medium text-muted-foreground">5 pasos clave antes de confirmar tu cuarto</p>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {checklist.map(([title, copy, checked], index) => (
                    <label key={title} className="flex gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked={checked} className="mt-1 size-4 rounded border-border" />
                      <span>
                        <span className="block text-sm font-bold">{index + 1}. {title}</span>
                        <span className="block text-xs font-medium leading-5 text-muted-foreground">{copy}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700"><ShieldCheck size={19} /></span>
                  <h2 className="text-lg font-bold">Garantía Habitat</h2>
                </div>
                <p className="text-sm font-medium leading-6 text-muted-foreground">¿El alojamiento no coincide con las fotos o el anfitrión no asistió? Te reubicamos y te protegemos al instante.</p>
                <div className="mt-5 rounded-xl border border-border bg-secondary/60 p-4 text-sm">
                  <div className="flex justify-between gap-4"><span className="font-bold text-muted-foreground">Soporte:</span><span className="font-bold text-emerald-700">soporte@habitat.com</span></div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
      {toast && <Toast onClose={() => setToast('')}>{toast}</Toast>}

      {pendingCancel && (
        <div role="dialog" className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl text-center">
            <TriangleAlert size={40} className="mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-bold mb-2">¿Estás seguro de cancelar?</h3>
            <p className="text-sm text-muted-foreground mb-6">El propietario será notificado de tu cancelación.</p>
            <div className="flex gap-3 justify-center">
              <button type="button" onClick={() => setPendingCancel(null)} className="px-4 py-2 font-bold text-sm bg-secondary rounded-xl hover:bg-border transition">
                Volver
              </button>
              <button type="button" onClick={confirmCancel} className="px-4 py-2 font-bold text-sm text-white bg-red-600 rounded-xl hover:bg-red-700 transition">
                Sí, cancelar visita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
