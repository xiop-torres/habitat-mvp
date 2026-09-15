'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  CalendarCheck2,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Home,
  Mail,
  MessageCircle,
  MoreVertical,
  Settings,
  ShieldCheck,
  Smartphone,
  UserRound,
} from 'lucide-react'
import { AppHeader, Footer } from '@/components/Shared'
import { cn } from '@/lib/utils'

const notificationSeed = [
  {
    id: 1,
    group: 'Hoy',
    category: 'visitas',
    badge: 'Cita confirmada',
    meta: 'Yanahuara, Arequipa',
    title: '¡Don Carlos M. confirmó tu visita presencial!',
    text: 'Tu visita para Habitación amoblada en Yanahuara ha sido aceptada para este lunes a las 11:00 AM.',
    time: 'Hace 25 min',
    icon: CalendarCheck2,
    unread: true,
    primaryAction: 'Ver detalles de la visita',
    href: '/visitas',
  },
  {
    id: 2,
    group: 'Hoy',
    category: 'mensajes',
    badge: 'Chat de arrendador',
    meta: 'Verificada',
    title: 'Nuevo mensaje de Sra. Elena Valdivia (Cayma)',
    text: 'Hola Diego, sí tenemos disponibilidad para visita virtual por Google Meet hoy a las 4:30 PM.',
    time: 'Hace 1 hora',
    icon: MessageCircle,
    unread: true,
    primaryAction: 'Responder en el chat',
    href: '/mensajes',
  },
  {
    id: 3,
    group: 'Hoy',
    category: 'favoritos',
    badge: 'Oferta en favorito',
    meta: 'A 8 min de UCSM',
    title: '¡Bajó de precio una habitación en tus favoritos!',
    text: 'La Habitación luminosa en Umacollo bajó a S/ 520 al mes. Solo quedan 2 habitaciones disponibles.',
    time: 'Hace 3 horas',
    icon: CircleDollarSign,
    unread: true,
    primaryAction: 'Ver habitación',
    href: '/favoritos',
  },
  {
    id: 4,
    group: 'Ayer',
    category: 'visitas',
    badge: 'Historial de citas',
    meta: '#VIS-8492',
    title: 'Reprogramación confirmada con éxito',
    text: 'Liberamos tu cupo anterior del sábado y confirmamos el nuevo turno para el lunes 21 a las 11:00 AM.',
    time: 'Ayer, 04:15 PM',
    icon: Clock3,
    unread: false,
    primaryAction: 'Ver comprobante',
    href: '/visitas',
  },
  {
    id: 5,
    group: 'Ayer',
    category: 'seguridad',
    badge: 'Auditoría Habitat',
    meta: 'Campus UCSM',
    title: 'Nuevo alojamiento verificado cerca de tu facultad',
    text: 'Auditamos presencialmente un mini departamento en Yanahuara Tradicional a 6 minutos a pie del campus.',
    time: 'Ayer, 10:30 AM',
    icon: ShieldCheck,
    unread: false,
    primaryAction: 'Explorar alojamiento',
    href: '/buscar',
  },
  {
    id: 6,
    group: 'Esta semana',
    category: 'seguridad',
    badge: 'Consejo estudiantil',
    meta: '16 de Octubre',
    title: 'Recordatorio: Prepara tu visita de mañana',
    text: 'Recuerda llevar tu carné universitario vigente y solicitar el test presencial de velocidad WiFi al propietario.',
    time: '16 de Octubre',
    icon: CheckCheck,
    unread: false,
    primaryAction: 'Ver checklist de visita',
    href: '/visitas',
  },
]

const filters = [
  { key: 'todas', label: 'Todas', count: 12 },
  { key: 'visitas', label: 'Visitas y citas', count: 5 },
  { key: 'mensajes', label: 'Mensajes y chat', count: 3 },
  { key: 'favoritos', label: 'Precios y favoritos', count: 2 },
  { key: 'seguridad', label: 'Novedades y seguridad', count: 2 },
]

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState('todas')
  const [onlyUnread, setOnlyUnread] = useState(false)
  const [readIds, setReadIds] = useState<number[]>([])

  const items = useMemo(() => notificationSeed.map(item => ({ ...item, unread: item.unread && !readIds.includes(item.id) })), [readIds])
  const unreadCount = items.filter(item => item.unread).length
  const filtered = items.filter(item => (activeFilter === 'todas' || item.category === activeFilter) && (!onlyUnread || item.unread))
  const groups = ['Hoy', 'Ayer', 'Esta semana']

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Link href="/" className="inline-flex items-center gap-1 hover:text-foreground"><Home size={13} /> Inicio</Link>
          <ChevronRight size={13} />
          <span>Mi cuenta</span>
          <ChevronRight size={13} />
          <span className="text-foreground">Notificaciones</span>
        </div>

        <section className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight">Centro de Notificaciones</h1>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/25 px-3 py-1 text-xs font-black">
              <span className="size-2 rounded-full bg-primary" />
              {unreadCount} no leídas
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setReadIds(notificationSeed.map(item => item.id))} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-bold transition hover:bg-primary/20">
              <CheckCheck size={17} /> Marcar todas como leídas
            </button>
            <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold transition hover:bg-secondary">
              <Settings size={17} /> Configuración de alertas
            </button>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-card p-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {filters.map(filter => (
                <button key={filter.key} type="button" onClick={() => setActiveFilter(filter.key)} className={cn('inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition', activeFilter === filter.key ? 'bg-primary text-foreground shadow-sm' : 'bg-background hover:bg-secondary')}>
                  {filter.label}
                  <span className={cn('rounded-full px-2 py-0.5 text-[11px]', activeFilter === filter.key ? 'bg-foreground text-background' : 'bg-secondary text-foreground')}>{filter.count}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold">
                Todas las fechas <ChevronDown size={16} />
              </button>
              <label className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold">
                <input type="checkbox" checked={onlyUnread} onChange={event => setOnlyUnread(event.target.checked)} className="size-4 accent-[var(--primary)]" />
                Solo no leídas
              </label>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <section className="space-y-9">
            {groups.map(group => {
              const groupItems = filtered.filter(item => item.group === group)
              if (!groupItems.length) return null
              return (
                <div key={group}>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-black">{group}</h2>
                    <span className="text-xs font-semibold text-muted-foreground">{group === 'Hoy' ? `${groupItems.length} nuevas actualizaciones` : group === 'Ayer' ? '20 de Octubre' : '14 - 19 de Octubre'}</span>
                  </div>
                  <div className="space-y-4">
                    {groupItems.map(item => {
                      const Icon = item.icon
                      return (
                        <article key={item.id} className={cn('relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md', item.unread ? 'border-primary/50 bg-primary/10' : 'border-border')}>
                          {item.unread && <span className="absolute left-0 top-0 h-full w-1 bg-primary" />}
                          <div className="flex gap-4">
                            <div className={cn('relative grid size-12 shrink-0 place-items-center rounded-2xl', item.unread ? 'bg-primary text-foreground' : 'bg-secondary text-muted-foreground')}>
                              <Icon size={22} />
                              {item.unread && <span className="absolute -right-1 -top-1 size-3 rounded-full bg-foreground ring-2 ring-card" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-md bg-secondary px-2 py-1 text-[11px] font-black">{item.badge}</span>
                                <span className="text-xs font-semibold text-muted-foreground">{item.meta}</span>
                              </div>
                              <div className="mt-2 flex items-start justify-between gap-3">
                                <h3 className="text-lg font-black leading-snug">{item.title}</h3>
                                <span className="shrink-0 text-xs font-semibold text-muted-foreground">{item.time}</span>
                              </div>
                              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
                              <div className="mt-4 flex flex-wrap items-center gap-2">
                                <Link href={item.href} className={cn('inline-flex min-h-10 items-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition', item.unread ? 'bg-primary hover:bg-primary/80' : 'bg-secondary hover:bg-primary/20')}>
                                  {item.primaryAction}
                                </Link>
                                {item.unread && <button type="button" onClick={() => setReadIds(ids => [...ids, item.id])} className="inline-flex min-h-10 items-center rounded-xl px-3 py-2 text-sm font-bold hover:bg-secondary">Marcar como leída</button>}
                              </div>
                            </div>
                            <button type="button" aria-label="Más opciones" className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-secondary"><MoreVertical size={17} /></button>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            <div className="py-10 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-primary"><CheckCheck size={20} /></span>
              <h2 className="mt-3 font-black">Has revisado todas tus alertas recientes</h2>
              <p className="mt-1 text-sm text-muted-foreground">Las notificaciones con más de 30 días se archivan de manera automática.</p>
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl bg-primary/25 p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-[0.12em]">Próxima visita en agenda</p>
                <span className="size-2 rounded-full bg-foreground" />
              </div>
              <h2 className="mt-4 text-xl font-black">Yanahuara Tradicional</h2>
              <p className="mt-1 text-sm text-muted-foreground">Con Don Carlos Morales, anfitrión</p>
              <div className="mt-4 rounded-xl bg-background p-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/20"><Clock3 size={20} /></span>
                  <div>
                    <p className="text-sm font-black">Lunes 21 Oct, 11:00 AM</p>
                    <p className="text-xs text-muted-foreground">Alerta programada a las 09:00 AM</p>
                  </div>
                </div>
              </div>
              <Link href="/visitas" className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-black">Ver ruta y cómo llegar</Link>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black">Canales de Entrega</h2>
                <Bell size={18} className="text-primary" />
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Recibe alertas críticas de citas y bajas de precio al instante.</p>
              <div className="mt-4 space-y-3">
                {[
                  { icon: Smartphone, label: 'WhatsApp', value: '+51 987 *** 210' },
                  { icon: Mail, label: 'Correo UCSM', value: 'diego.r@ucsm.edu.pe' },
                  { icon: Bell, label: 'Notificaciones Web', value: 'Navegador activo' },
                ].map(channel => {
                  const Icon = channel.icon
                  return (
                    <div key={channel.label} className="flex items-center justify-between gap-3 rounded-xl bg-secondary p-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-xl bg-primary/25"><Icon size={17} /></span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black">{channel.label}</p>
                          <p className="truncate text-xs text-muted-foreground">{channel.value}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-black text-emerald-700">Activo</span>
                    </div>
                  )
                })}
              </div>
              <button type="button" className="mt-4 inline-flex items-center gap-2 text-sm font-black text-foreground">Personalizar preferencias <ChevronRight size={16} /></button>
            </section>

            <section className="rounded-2xl border border-border bg-secondary/70 p-5">
              <div className="flex items-center gap-2">
                <UserRound size={18} className="text-primary" />
                <h2 className="font-black">Asistencia Habitat Perú</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">¿Un arrendador no respondió a tu cita o canceló a último momento? Nuestro equipo puede ayudarte a reubicarte.</p>
              <Link href="/mensajes" className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-card px-4 py-2 text-sm font-black">
                <MessageCircle size={17} /> Hablar con un asesor Habitat
              </Link>
            </section>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  )
}
