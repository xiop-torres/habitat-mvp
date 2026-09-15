'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
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
  SlidersHorizontal,
  Star,
  UserRound,
  X,
} from 'lucide-react'
import { AppHeader, Footer, Toast } from '@/components/Shared'
import { mockRooms } from '@/lib/mocks'
import { cn } from '@/lib/utils'

type VisitStatus = 'proximas' | 'pasadas' | 'canceladas'

const initialVisits = [
  {
    id: 1,
    code: 'VIS-8492',
    status: 'proximas' as VisitStatus,
    modality: 'presencial',
    room: mockRooms[0],
    title: 'Habitación privada amoblada cerca de la UCSM',
    address: 'Calle Cortaderas 214, Yanahuara',
    district: 'Yanahuara',
    date: 'Hoy, sábado 19 de octubre',
    time: '11:30 AM - 12:00 PM',
    ribbon: 'Próxima visita hoy · En 2 horas y 15 minutos',
    host: 'Don Carlos M.',
    hostRating: '4.9 (14 reseñas de estudiantes)',
    details: 'Baño propio · Servicios incluidos',
  },
  {
    id: 2,
    code: 'VIS-7821',
    status: 'pasadas' as VisitStatus,
    modality: 'presencial',
    room: mockRooms[3],
    title: 'Casa compartida para universitarios',
    address: 'Urb. La Melgariana, José Luis Bustamante',
    district: 'J. L. Bustamante',
    date: 'Sábado 12 de octubre',
    time: '04:00 PM - 04:30 PM',
    ribbon: 'Visita realizada',
    host: 'Luis G.',
    hostRating: '4.7 (9 reseñas de estudiantes)',
    details: 'Cocina compartida · Patio',
  },
]

const tabs: { id: VisitStatus; label: string }[] = [
  { id: 'proximas', label: 'Próximas' },
  { id: 'pasadas', label: 'Pasadas' },
  { id: 'canceladas', label: 'Canceladas' },
]

const checklist = [
  ['Carné universitario', 'Llévalo contigo para validar tu matrícula estudiantil.', true],
  ['Test de WiFi y señal móvil', 'Prueba velocidad exacta en el escritorio de estudio.', true],
  ['Ducha y presión de agua', 'Comprueba terma eléctrica/solar y caudal en horarios punta.', false],
  ['Horarios y normas', 'Aclara llaves independientes, uso de cocina y visitas.', false],
  ['Cero adelantos informales', 'Paga con depósito de garantía respaldado en Habitat.', false],
] as const

export default function VisitsPage() {
  const [active, setActive] = useState<VisitStatus>('proximas')
  const [visits, setVisits] = useState(initialVisits)
  const [pendingCancel, setPendingCancel] = useState<number | null>(null)
  const [toast, setToast] = useState('')

  const counts = useMemo(() => ({
    proximas: visits.filter(visit => visit.status === 'proximas').length,
    pasadas: visits.filter(visit => visit.status === 'pasadas').length,
    canceladas: visits.filter(visit => visit.status === 'canceladas').length,
  }), [visits])

  const visible = visits.filter(visit => visit.status === active)
  const cancelVisit = visits.find(visit => visit.id === pendingCancel)

  function confirmCancel() {
    if (!pendingCancel) return
    setVisits(current => current.map(visit => visit.id === pendingCancel ? { ...visit, status: 'canceladas' as VisitStatus, ribbon: 'Visita cancelada' } : visit))
    setPendingCancel(null)
    setActive('canceladas')
    setToast('Visita cancelada. El anfitrión fue notificado.')
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main>
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Link href="/buscar" className="flex items-center gap-1 hover:text-foreground">
                <UserRound size={14} />
                Inicio
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
                  <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-bold text-foreground">Semestre 2024-II</span>
                </div>
                <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-muted-foreground sm:text-base">
                  Gestiona y da seguimiento a tus visitas presenciales y virtuales a alojamientos verificados cerca de tu universidad.
                </p>
              </div>
              <Link href="/buscar" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold shadow-sm transition hover:bg-primary-hover">
                <Search size={17} />
                Explorar más alojamientos
              </Link>
            </div>

            <div className="mt-8 flex flex-col gap-4 border-t border-border pt-4 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-2 overflow-x-auto">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActive(tab.id)}
                    className={cn(
                      'inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold transition',
                      active === tab.id ? 'bg-primary text-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                    )}
                  >
                    {tab.label}
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-bold', active === tab.id ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground')}>
                      {counts[tab.id]}
                    </span>
                  </button>
                ))}
              </div>
              <label className="flex min-h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-bold text-muted-foreground">
                <SlidersHorizontal size={16} />
                Modalidad:
                <select className="border-0 bg-transparent py-0 pl-1 pr-8 text-sm font-bold text-foreground focus:ring-0">
                  <option>Todas</option>
                  <option>Presencial</option>
                  <option>Virtual</option>
                </select>
              </label>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <section className="space-y-5 lg:col-span-8">
              {visible.length ? visible.map(visit => (
                <article key={visit.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md">
                  <div className={cn('flex items-center justify-between px-5 py-3 text-sm font-bold uppercase tracking-wide', visit.status === 'canceladas' ? 'bg-muted-foreground text-background' : 'bg-foreground text-background')}>
                    <span className="flex items-center gap-2">
                      {visit.status === 'canceladas' ? <X size={17} /> : <AlertCircle size={17} className="text-primary" />}
                      {visit.ribbon}
                    </span>
                    <span className="rounded-full bg-background/10 px-2.5 py-1 text-xs font-bold">Reserva #{visit.code}</span>
                  </div>
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-6 md:flex-row">
                      <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-xl bg-secondary md:w-48">
                        <img src={visit.room.image} alt="" className="h-full w-full object-cover" />
                        <span className="absolute left-2 top-2 rounded-lg bg-card/95 px-2 py-1 text-xs font-bold shadow-sm">{visit.district}</span>
                        <span className="absolute bottom-2 left-2 rounded-lg bg-foreground/90 px-2.5 py-1 text-sm font-bold text-background">S/ {visit.room.price} <span className="text-xs font-medium text-background/70">/ mes</span></span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold', visit.status === 'canceladas' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700')}>
                            {visit.status === 'canceladas' ? <X size={13} /> : <CheckCircle2 size={13} />}
                            {visit.status === 'canceladas' ? 'Cancelada' : 'Confirmada'}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-bold text-muted-foreground">
                            <Footprints size={13} />
                            {visit.modality === 'presencial' ? 'Presencial' : 'Virtual'}
                          </span>
                        </div>

                        <h2 className="mt-3 text-xl font-bold">{visit.title}</h2>
                        <p className="mt-1 text-sm font-medium text-muted-foreground">{visit.address} · A 8 min a pie de UCSM</p>

                        <div className="mt-4 grid gap-3 rounded-xl border border-border bg-secondary/60 p-4 sm:grid-cols-2">
                          <div className="flex gap-3">
                            <Clock3 className="mt-0.5 size-5 text-foreground" />
                            <div>
                              <p className="text-xs font-bold text-muted-foreground">Fecha y horario</p>
                              <p className="mt-1 text-sm font-bold">{visit.date} · {visit.time}</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <ShieldCheck className="mt-0.5 size-5 text-emerald-700" />
                            <div>
                              <p className="text-xs font-bold text-muted-foreground">Tipo</p>
                              <p className="mt-1 text-sm font-bold">{visit.details}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <span className="grid size-10 place-items-center rounded-full border border-border bg-secondary text-sm font-bold">CM</span>
                            <div>
                              <p className="flex items-center gap-1 text-sm font-bold">{visit.host}<CheckCircle2 size={14} className="text-emerald-600" /></p>
                              <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground"><Star size={13} className="fill-primary text-primary" />{visit.hostRating}</p>
                            </div>
                          </div>
                          <Link href="/mensajes" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700">
                            <MessageSquare size={16} />
                            WhatsApp anfitrión
                          </Link>
                        </div>

                        {visit.status === 'pasadas' ? (
                          <div className="mt-5 rounded-xl border border-border bg-secondary/70 p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="font-bold">¿Cómo te fue en la visita?</p>
                                <p className="text-sm font-medium text-muted-foreground">Puntúa al propietario para ayudar a otros estudiantes.</p>
                              </div>
                              <div className="flex items-center gap-1 text-primary">
                                {[1, 2, 3, 4].map(item => <Star key={item} className="size-5 fill-primary" />)}
                                <Star className="size-5 text-muted-foreground" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                            <div className="flex flex-wrap gap-2">
                              <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-bold hover:bg-border">
                                <Footprints size={16} />
                                Ruta a pie (8 min)
                              </button>
                              <Link href="/mensajes" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold hover:bg-primary-hover">
                                <MessageSquare size={16} />
                                Chat Seguro Habitat
                              </Link>
                            </div>
                            {visit.status !== 'canceladas' && (
                              <div className="flex gap-3 text-sm font-bold">
                                <button type="button" className="text-muted-foreground hover:text-foreground">Reprogramar</button>
                                <button type="button" onClick={() => setPendingCancel(visit.id)} className="text-red-600 hover:text-red-700">Cancelar visita</button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              )) : (
                <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
                  <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary text-foreground"><CalendarDays size={30} /></span>
                  <h2 className="mt-5 text-xl font-bold">No tienes visitas en esta sección</h2>
                  <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-muted-foreground">Explora habitaciones disponibles cerca de tu universidad y agenda tu próxima visita.</p>
                  <Link href="/buscar" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold hover:bg-primary-hover"><Search size={17} />Explorar más alojamientos</Link>
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
                    <label key={title} className="flex gap-3">
                      <input type="checkbox" defaultChecked={checked} className="mt-1 size-4 rounded border-border" />
                      <span>
                        <span className="block text-sm font-bold">{index + 1}. {title}</span>
                        <span className="block text-xs font-medium leading-5 text-muted-foreground">{copy}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <div className="mt-5 border-t border-border pt-4">
                  <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full w-2/5 rounded-full bg-primary" /></div>
                  <p className="mt-2 text-right text-xs font-semibold text-muted-foreground">Progreso de preparación: 2 de 5</p>
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700"><ShieldCheck size={19} /></span>
                  <h2 className="text-lg font-bold">Garantía Habitat</h2>
                </div>
                <p className="text-sm font-medium leading-6 text-muted-foreground">¿El alojamiento no coincide con las fotos o el anfitrión no asistió? Te reubicamos y te protegemos al instante.</p>
                <div className="mt-5 rounded-xl border border-border bg-secondary/60 p-4 text-sm">
                  <div className="flex justify-between gap-4"><span className="font-bold text-muted-foreground">WhatsApp Estudiantes:</span><span className="font-bold text-emerald-700">+51 954 120 488</span></div>
                  <div className="mt-2 flex justify-between gap-4"><span className="font-bold text-muted-foreground">Horario de soporte:</span><span className="font-medium">8:00 AM - 8:00 PM</span></div>
                </div>
                <Link href="/mensajes" className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-3 text-sm font-bold hover:bg-border">
                  <MessageSquare size={16} />
                  Reportar incidencia de visita
                </Link>
              </section>
            </aside>
          </div>
        </div>
      </main>

      {pendingCancel !== null && cancelVisit && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
              <div>
                <p className="flex items-center gap-2 text-sm font-bold text-red-600"><X size={17} />Cancelar visita</p>
                <h2 className="mt-1 text-xl font-bold">¿Deseas cancelar esta visita?</h2>
              </div>
              <button type="button" onClick={() => setPendingCancel(null)} className="grid size-10 place-items-center rounded-full hover:bg-secondary" aria-label="Cerrar"><X size={18} /></button>
            </div>
            <div className="py-5">
              <p className="text-sm font-medium leading-6 text-muted-foreground">Estás a punto de cancelar tu visita programada para:</p>
              <div className="mt-3 rounded-xl border border-border bg-secondary/70 p-4">
                <p className="font-bold">{cancelVisit.title}</p>
                <p className="mt-1 text-sm font-medium text-muted-foreground">{cancelVisit.date} · {cancelVisit.time}</p>
              </div>
              <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">El anfitrión será notificado para liberar el horario.</p>
            </div>
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <button type="button" onClick={() => setPendingCancel(null)} className="rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold hover:bg-border">Mantener visita</button>
              <button type="button" onClick={confirmCancel} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700">Sí, cancelar</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      {toast && <Toast onClose={() => setToast('')}>{toast}</Toast>}
    </div>
  )
}
