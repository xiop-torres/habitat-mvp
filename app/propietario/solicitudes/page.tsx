'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BadgeCheck,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MessageSquare,
  Search,
  ShieldCheck,
  UserRound,
  Video,
  X,
  Zap,
  Loader2,
  AlertTriangle,
  TriangleAlert,
} from 'lucide-react'
import { AppHeader, Footer, Toast } from '@/components/Shared'
import { getOwnerVisits, updateVisitStatus, type VisitRequest, type VisitStatus, type VisitMode } from '@/lib/supabase/visits'
import { cn } from '@/lib/utils'
import { getListingImageUrl } from '@/lib/supabase/storage'
import { useRouter } from 'next/navigation'

export default function RequestsPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<VisitRequest[]>([])
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'rescheduled' | 'history' | 'all'>('pending')
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  
  const [rescheduleData, setRescheduleData] = useState<{ id: string, date: string, shift: string } | null>(null)

  useEffect(() => {
    loadVisits()
  }, [])

  async function loadVisits() {
    setLoading(true)
    setError('')
    try {
      const data = await getOwnerVisits()
      setRequests(data)
    } catch (err: any) {
      setError(err.message || 'Error al cargar las solicitudes.')
    } finally {
      setLoading(false)
    }
  }

  const pendingCount = useMemo(() => requests.filter(r => r.status === 'pending').length, [requests])
  const acceptedCount = useMemo(() => requests.filter(r => r.status === 'accepted').length, [requests])
  const rescheduledCount = useMemo(() => requests.filter(r => r.status === 'rescheduled').length, [requests])
  const historyCount = useMemo(() => requests.filter(r => ['rejected', 'cancelled', 'completed'].includes(r.status)).length, [requests])

  const stats = [
    ['Por confirmar', pendingCount.toString(), 'Pendientes de respuesta', CalendarClock, 'bg-primary/25 text-foreground'],
    ['Confirmadas', acceptedCount.toString(), 'Visitas aprobadas', CheckCircle2, 'bg-emerald-100 text-emerald-700'],
    ['Reprogramadas', rescheduledCount.toString(), 'Esperando confirmación', CalendarClock, 'bg-orange-100 text-orange-700'],
    ['Historial', historyCount.toString(), 'Cerradas', BadgeCheck, 'bg-secondary text-foreground'],
  ] as const

  const visibleRequests = useMemo(() => {
    if (activeTab === 'all') return requests
    if (activeTab === 'history') return requests.filter(r => ['rejected', 'cancelled', 'completed'].includes(r.status))
    return requests.filter(r => r.status === activeTab)
  }, [requests, activeTab])

  async function handleStatusUpdate(id: string, newStatus: VisitStatus, rescheduleArgs?: { requestedDate: string, requestedTime: string }) {
    try {
      const { success, error: updateError } = await updateVisitStatus(id, newStatus, rescheduleArgs)
      if (success) {
        setToast(`Solicitud actualizada a: ${newStatus}`)
        await loadVisits()
      } else {
        setToast(`Error: ${updateError}`)
      }
    } catch (err: any) {
      setToast('Ocurrió un error inesperado.')
    }
    setRescheduleData(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader owner />
      <main>
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Link href="/propietario" className="flex items-center gap-1 hover:text-foreground">
                <UserRound size={14} /> Panel
              </Link>
              <ChevronRight size={14} />
              <span className="text-foreground">Solicitudes de visita</span>
            </nav>

            <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Gestión de solicitudes</h1>
                  <span className="rounded-full bg-primary/25 px-3 py-1 text-xs font-bold ring-1 ring-primary/40">
                    {pendingCount} pendientes
                  </span>
                </div>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-muted-foreground sm:text-base">
                  Revisa y gestiona las solicitudes de visita de los estudiantes.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link href="/propietario/calendario" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-bold text-background shadow-sm transition hover:opacity-90">
                  <CalendarDays size={17} /> Ver calendario
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex max-w-full gap-1.5 overflow-x-auto pb-2 sm:gap-2 sm:pb-0">
                {[
                  { label: `Pendientes (${pendingCount})`, status: 'pending' },
                  { label: `Confirmadas (${acceptedCount})`, status: 'accepted' },
                  { label: `Reprogramadas (${rescheduledCount})`, status: 'rescheduled' },
                  { label: `Historial (${historyCount})`, status: 'history' },
                  { label: 'Todas', status: 'all' },
                ].map((tab) => (
                  <button
                    key={tab.status}
                    type="button"
                    onClick={() => setActiveTab(tab.status as any)}
                    className={cn(
                      'min-h-9 sm:min-h-10 shrink-0 whitespace-nowrap rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold transition',
                      activeTab === tab.status ? 'bg-primary text-foreground shadow-sm' : 'bg-secondary text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(([label, value, copy, Icon, tone]) => (
              <article key={label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-muted-foreground">{label}</span>
                  <span className={cn('grid size-9 place-items-center rounded-xl', tone)}>
                    <Icon size={19} />
                  </span>
                </div>
                <p className="mt-4 text-3xl font-bold">{value}</p>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">{copy}</p>
              </article>
            ))}
          </section>

          <div className="mt-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 size={40} className="animate-spin mb-4 text-primary" />
                <p className="text-sm font-bold">Cargando solicitudes...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-destructive">
                <TriangleAlert size={40} className="mb-4" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            ) : visibleRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <CalendarDays size={40} className="mb-4 text-border" />
                <p className="text-sm font-bold">No hay solicitudes en esta categoría.</p>
              </div>
            ) : (
              <section className="space-y-5">
                {visibleRequests.map((request) => {
                  const cover = request.listing?.listing_images?.find((i: any) => i.is_cover) || request.listing?.listing_images?.[0]
                  const imageUrl = cover ? getListingImageUrl(cover.storage_path) : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800'
                  
                  const isPending = request.status === 'pending'
                  const isRescheduled = request.status === 'rescheduled'
                  const isAccepted = request.status === 'accepted'

                  return (
                    <article key={request.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md">
                      <div className="p-5">
                        <div className="flex flex-col gap-5 md:flex-row">
                          <img src={imageUrl} alt="" className="h-44 w-full rounded-xl object-cover md:w-52" />
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h2 className="text-xl font-bold">{request.student?.first_name} {request.student?.last_name}</h2>
                                  {request.student?.university && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                      <ShieldCheck size={13} />
                                      {request.student.university}
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 text-sm font-medium text-muted-foreground">{request.listing?.title || 'Alojamiento no disponible'}</p>
                              </div>
                              <div className="text-left md:text-right">
                                {request.listing?.price_monthly && (
                                  <p className="text-2xl font-bold">S/ {request.listing.price_monthly} <span className="text-xs font-semibold text-muted-foreground">/ mes</span></p>
                                )}
                                <span className={cn(
                                  'mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider',
                                  request.status === 'pending' ? 'bg-primary/25 text-foreground' : 
                                  request.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 
                                  request.status === 'rescheduled' ? 'bg-orange-100 text-orange-700' : 
                                  'bg-red-100 text-red-700',
                                )}>
                                  {request.status}
                                </span>
                              </div>
                            </div>

                            <div className="mt-4 grid gap-3 rounded-xl bg-secondary/70 p-4 sm:grid-cols-3">
                              <div>
                                <p className="text-xs font-bold text-muted-foreground">Fecha solicitada</p>
                                <p className="mt-1 text-sm font-bold">{request.requested_date}</p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-muted-foreground">Horario</p>
                                <p className="mt-1 flex items-center gap-1 text-sm font-bold"><Clock3 size={14} />{request.requested_time}</p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-muted-foreground">Modalidad</p>
                                <p className="mt-1 flex items-center gap-1 text-sm font-bold capitalize">
                                  {request.mode === 'virtual' ? <Video size={14} /> : <CalendarDays size={14} />}
                                  {request.mode}
                                </p>
                              </div>
                            </div>

                            {request.message && (
                              <p className="mt-4 rounded-xl bg-primary/10 p-4 text-sm font-medium leading-6 text-foreground">
                                “{request.message}”
                              </p>
                            )}

                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex flex-wrap gap-3 text-sm font-bold text-muted-foreground">
                                Fecha de creación: {new Date(request.created_at).toLocaleDateString()}
                              </div>
                              
                              <div className="flex flex-wrap gap-2">
                                {(isPending || isRescheduled) && (
                                  <>
                                    <button type="button" onClick={() => handleStatusUpdate(request.id, 'rejected')} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50">
                                      <X size={15} />
                                      Rechazar
                                    </button>
                                    <button type="button" onClick={() => handleStatusUpdate(request.id, 'accepted')} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold shadow-sm hover:bg-primary-hover">
                                      <Check size={15} />
                                      Aceptar visita
                                    </button>
                                  </>
                                )}

                                {isPending && (
                                  <button type="button" onClick={() => setRescheduleData({ id: request.id, date: request.requested_date, shift: request.requested_time })} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold hover:bg-secondary">
                                    Reprogramar
                                  </button>
                                )}

                                {isAccepted && (
                                  <>
                                    <button type="button" onClick={() => handleStatusUpdate(request.id, 'cancelled')} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50">
                                      Cancelar visita
                                    </button>
                                    <button type="button" onClick={() => handleStatusUpdate(request.id, 'completed')} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-600">
                                      Marcar como completada
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </section>
            )}
          </div>
        </div>
      </main>
      <Footer />
      {toast && <Toast onClose={() => setToast('')}>{toast}</Toast>}

      {/* Reschedule Modal */}
      {rescheduleData && (
        <div role="dialog" className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
            <h3 className="text-lg font-bold">Reprogramar visita</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Selecciona una nueva fecha y turno.</p>
            
            <label className="grid gap-2 text-sm font-semibold mb-4">
              Nueva fecha
              <input 
                type="date" 
                className="field" 
                min={new Date().toISOString().split('T')[0]}
                value={rescheduleData.date}
                onChange={e => setRescheduleData({ ...rescheduleData, date: e.target.value })}
              />
            </label>

            <div className="mb-6">
              <p className="mb-2 text-sm font-semibold">Nuevo turno</p>
              <div className="grid gap-2">
                {['Mañana – 9:00 - 12:00', 'Tarde – 14:00 - 18:00', 'Noche – 18:00 - 20:00'].map(item => (
                  <button 
                    type="button" 
                    key={item} 
                    onClick={() => setRescheduleData({ ...rescheduleData, shift: item })} 
                    className={cn(
                      'rounded-xl border px-3 py-3 text-left text-xs font-semibold transition-colors', 
                      rescheduleData.shift === item ? 'border-primary bg-primary/20' : 'border-border hover:bg-secondary/50'
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setRescheduleData(null)} className="px-4 py-2 font-bold text-sm">
                Cancelar
              </button>
              <button 
                type="button" 
                disabled={!rescheduleData.date}
                onClick={() => handleStatusUpdate(rescheduleData.id, 'rescheduled', { requestedDate: rescheduleData.date, requestedTime: rescheduleData.shift })} 
                className="rounded-xl bg-primary px-4 py-2 font-bold text-sm"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
