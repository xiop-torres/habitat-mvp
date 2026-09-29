'use client'

import { useMemo, useState } from 'react'
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
  MoreVertical,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  Video,
  X,
  Zap,
} from 'lucide-react'
import { AppHeader, Footer, Toast } from '@/components/Shared'
import { mockRequests, mockRooms } from '@/lib/mocks'
import { cn } from '@/lib/utils'

const initialRequests = [
  {
    ...mockRequests[0],
    name: 'Diego Rodríguez',
    initials: 'DR',
    university: 'UCSM verificado',
    profile: 'Medicina Humana · 5to ciclo',
    tag: 'Urgente',
    mode: 'Presencial',
    message:
      'Hola Carlos, puedo visitar hoy antes de clases. Me interesa confirmar la señal de internet y si el escritorio queda junto a la ventana.',
  },
  {
    ...mockRequests[1],
    name: 'Valeria Cornejo',
    initials: 'VC',
    university: 'UCSM verificada',
    profile: 'Arquitectura · 6to ciclo',
    tag: 'Pregunta por reglas',
    mode: 'Presencial',
    message:
      'Buenas tardes, estudio arquitectura en la Católica de Santa María. ¿Se permiten maquetas y trabajos grandes en el cuarto?',
  },
  {
    id: 3,
    name: 'Lucía Vega',
    initials: 'LV',
    room: mockRooms[1],
    date: 'Mañana, domingo 20 de octubre',
    shift: 'Tarde · 4:00 PM',
    status: 'Pendiente',
    university: 'UNSA verificada',
    profile: 'Ingeniería Industrial · 7mo ciclo',
    tag: 'Asiste con apoderada',
    mode: 'Presencial',
    message:
      'Buenas tardes Carlos, revisé las fotos y quisiera visitar el mini departamento con mi mamá antes de tomar una decisión.',
  },
  {
    id: 4,
    name: 'Mateo Quispe',
    initials: 'MQ',
    room: mockRooms[2],
    date: 'Lunes 21 de octubre',
    shift: 'Mañana · 10:00 AM',
    status: 'Pendiente',
    university: 'Ingresante UCSM',
    profile: 'Derecho · llega desde Cusco',
    tag: 'Postulante foráneo',
    mode: 'Videollamada',
    message:
      'Aún estoy en Cusco organizando mi viaje. ¿Sería posible una videollamada para ver la habitación y resolver dudas del contrato?',
  },
]

const stats = [
  ['Por confirmar', '4', '1 expira en menos de 2 horas', CalendarClock, 'bg-primary/25 text-foreground'],
  ['Confirmadas', '6', 'Próxima hoy 4:30 PM', CheckCircle2, 'bg-emerald-100 text-emerald-700'],
  ['Realizadas', '18', '12 terminaron en contrato', BadgeCheck, 'bg-secondary text-foreground'],
  ['Tiempo respuesta', '24 min', 'Excelente para Habitat', Zap, 'bg-primary/25 text-foreground'],
] as const

export default function RequestsPage() {
  const [requests, setRequests] = useState(initialRequests)
  const [toast, setToast] = useState('')

  const pendingCount = useMemo(
    () => requests.filter(request => request.status === 'Pendiente').length,
    [requests],
  )

  function update(id: number, status: string) {
    setRequests(current => current.map(request => request.id === id ? { ...request, status } : request))
    setToast(status === 'Confirmada' ? 'Solicitud aceptada' : 'Solicitud rechazada')
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader owner />
      <main>
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Link href="/propietario" className="flex items-center gap-1 hover:text-foreground">
                <UserRound size={14} />
                Panel
              </Link>
              <ChevronRight size={14} />
              <span className="text-foreground">Solicitudes de visita</span>
            </nav>

            <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Gestión de solicitudes de visita</h1>
                  <span className="rounded-full bg-primary/25 px-3 py-1 text-xs font-bold ring-1 ring-primary/40">
                    {pendingCount} pendientes
                  </span>
                </div>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-muted-foreground sm:text-base">
                  Confirma, reprograma o responde a estudiantes verificados que quieren conocer tus alojamientos.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link href="/propietario/calendario" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-bold text-background shadow-sm transition hover:opacity-90">
                  <CalendarDays size={17} />
                  Ver calendario
                </Link>
                <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground shadow-sm transition hover:bg-secondary">
                  <SlidersHorizontal size={17} />
                  Disponibilidad
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex max-w-full gap-1.5 overflow-x-auto pb-2 sm:gap-2 sm:pb-0">
                {['Pendientes (4)', 'Confirmadas (6)', 'Completadas (18)', 'Canceladas (3)'].map((item, index) => (
                  <button
                    key={item}
                    type="button"
                    className={cn(
                      'min-h-9 sm:min-h-10 shrink-0 whitespace-nowrap rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold transition',
                      index === 0 ? 'bg-primary text-foreground shadow-sm' : 'bg-secondary text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label className="relative block sm:w-72">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input className="field bg-secondary pl-9 text-sm" placeholder="Buscar estudiante o alojamiento" />
                </label>
                <select className="field bg-secondary text-sm font-bold sm:w-56">
                  <option>Más urgentes primero</option>
                  <option>Fecha solicitada</option>
                  <option>Alojamiento</option>
                  <option>Universidad</option>
                </select>
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

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <section className="space-y-5 lg:col-span-8">
              {requests.map((request, index) => {
                const isPending = request.status === 'Pendiente'
                const urgent = index === 0 && isPending
                return (
                  <article key={request.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md">
                    {urgent && (
                      <div className="flex items-center justify-between bg-foreground px-5 py-3 text-background">
                        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                          <Zap size={17} className="text-primary" />
                          Solicitud urgente · vence en 2 horas
                        </div>
                        <span className="rounded-full bg-background/10 px-2.5 py-1 text-xs font-bold">#VIS-8492</span>
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex flex-col gap-5 md:flex-row">
                        <img src={request.room.image} alt="" className="h-44 w-full rounded-xl object-cover md:w-52" />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-xl font-bold">{request.name}</h2>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                  <ShieldCheck size={13} />
                                  {request.university}
                                </span>
                                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-muted-foreground">{request.tag}</span>
                              </div>
                              <p className="mt-1 text-sm font-medium text-muted-foreground">{request.profile}</p>
                            </div>
                            <div className="text-left md:text-right">
                              <p className="text-2xl font-bold">S/ {request.room.price} <span className="text-xs font-semibold text-muted-foreground">/ mes</span></p>
                              <span className={cn(
                                'mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold',
                                request.status === 'Pendiente' ? 'bg-primary/25 text-foreground' : request.status === 'Confirmada' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700',
                              )}>
                                {request.status}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3 rounded-xl bg-secondary/70 p-4 sm:grid-cols-3">
                            <div>
                              <p className="text-xs font-bold text-muted-foreground">Fecha</p>
                              <p className="mt-1 text-sm font-bold">{request.date}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-muted-foreground">Horario</p>
                              <p className="mt-1 flex items-center gap-1 text-sm font-bold"><Clock3 size={14} />{request.shift}</p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-muted-foreground">Modalidad</p>
                              <p className="mt-1 flex items-center gap-1 text-sm font-bold">{request.mode === 'Videollamada' ? <Video size={14} /> : <CalendarDays size={14} />}{request.mode}</p>
                            </div>
                          </div>

                          <p className="mt-4 rounded-xl bg-primary/10 p-4 text-sm font-medium leading-6 text-foreground">“{request.message}”</p>

                          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap gap-3 text-sm font-bold">
                              <a className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground" href="#"><BadgeCheck size={16} />Ver documentos</a>
                              <Link className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground" href="/mensajes"><MessageSquare size={16} />Responder</Link>
                            </div>
                            {isPending ? (
                              <div className="flex flex-wrap gap-2">
                                <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold hover:bg-secondary">
                                  Reprogramar
                                </button>
                                <button type="button" onClick={() => update(request.id, 'Rechazada')} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50">
                                  <X size={15} />
                                  Rechazar
                                </button>
                                <button type="button" onClick={() => update(request.id, 'Confirmada')} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold shadow-sm hover:bg-primary-hover">
                                  <Check size={15} />
                                  Aceptar visita
                                </button>
                              </div>
                            ) : (
                              <button type="button" className="grid size-11 place-items-center rounded-xl bg-secondary text-muted-foreground hover:text-foreground" aria-label="Más acciones">
                                <MoreVertical size={18} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </section>

            <aside className="space-y-5 lg:col-span-4">
              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary"><CalendarClock size={22} /></span>
                  <div>
                    <h2 className="text-lg font-bold">Agenda de hoy</h2>
                    <p className="text-xs font-medium text-muted-foreground">Sábado 19 de octubre</p>
                  </div>
                </div>
                <div className="mt-5 space-y-4 border-l-2 border-border pl-4">
                  {[
                    ['11:30 AM', 'Diego Rodríguez', 'Habitación Yanahuara', 'Pendiente'],
                    ['04:30 PM', 'Valeria Cornejo', 'Mini depto Cayma', 'Confirmada'],
                    ['06:00 PM', 'Andrea Mogrovejo', 'Yanahuara UCSM', 'Confirmada'],
                  ].map(([time, name, room, status]) => (
                    <div key={`${time}-${name}`} className="relative">
                      <span className={cn('absolute -left-[23px] top-1.5 size-3 rounded-full ring-4 ring-card', status === 'Pendiente' ? 'bg-primary' : 'bg-emerald-500')} />
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-bold">{time}</p>
                        <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-bold', status === 'Pendiente' ? 'bg-primary/25 text-foreground' : 'bg-emerald-100 text-emerald-700')}>{status}</span>
                      </div>
                      <p className="mt-1 text-sm font-bold">{name}</p>
                      <p className="text-xs font-medium text-muted-foreground">{room}</p>
                    </div>
                  ))}
                </div>
                <Link href="/propietario/calendario" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-secondary px-4 py-3 text-sm font-bold transition hover:bg-border">
                  Ver calendario completo
                </Link>
              </section>

              <section className="rounded-2xl border border-primary/40 bg-primary/15 p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary"><ShieldCheck size={22} /></span>
                  <div>
                    <h2 className="font-bold">Protocolo para anfitriones</h2>
                    <p className="mt-1 text-sm font-medium leading-6 text-foreground/75">
                      Verifica documentos, confirma la hora por chat y muestra WiFi, agua caliente y reglas de la casa durante la visita.
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h2 className="font-bold">Soporte Habitat</h2>
                <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">¿Tienes dudas con una solicitud o necesitas reprogramar una cita de urgencia?</p>
                <Link href="/mensajes" className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-bold text-background transition hover:opacity-90">
                  <MessageSquare size={17} />
                  Escribir a soporte
                </Link>
              </section>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
      {toast && <Toast onClose={() => setToast('')}>{toast}</Toast>}
    </div>
  )
}
