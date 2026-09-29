'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bell,
  CalendarCheck2,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Home,
  Mail,
  MessageCircle,
  MoreVertical,
  Settings,
  Smartphone,
  UserRound,
  Heart,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { AppHeader, Footer } from '@/components/Shared'
import { cn } from '@/lib/utils'
import { useCurrentUserProfile } from '@/lib/supabase/useProfile'
import { getMyNotifications, markNotificationAsRead, markAllNotificationsAsRead, type Notification } from '@/lib/supabase/notifications'

const getIconForType = (type: string) => {
  switch (type) {
    case 'visit': return CalendarCheck2
    case 'message': return MessageCircle
    case 'favorite': return Heart
    case 'listing': return Home
    default: return Bell
  }
}

const getBadgeForType = (type: string) => {
  switch (type) {
    case 'visit': return 'Cita'
    case 'message': return 'Mensaje'
    case 'favorite': return 'Favorito'
    case 'listing': return 'Alojamiento'
    default: return 'Alerta'
  }
}

function formatDateGroup(dateString: string) {
  const d = new Date(dateString)
  const now = new Date()
  
  // reset times to start of day for comparison
  const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  const diffTime = Math.abs(nowStart.getTime() - dStart.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  return new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)
}

function formatTime(dateString: string) {
  const d = new Date(dateString)
  return new Intl.DateTimeFormat('es-PE', { hour: 'numeric', minute: 'numeric', hour12: true }).format(d)
}

export default function NotificationsPage() {
  const { profile } = useCurrentUserProfile()
  const router = useRouter()
  
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [activeFilter, setActiveFilter] = useState('todas')
  const [onlyUnread, setOnlyUnread] = useState(false)

  useEffect(() => {
    async function loadNotifications() {
      try {
        setLoading(true)
        setError(null)
        const data = await getMyNotifications()
        setNotifications(data)
      } catch (err: any) {
        setError(err.message || 'Error al cargar notificaciones')
      } finally {
        setLoading(false)
      }
    }
    
    // Only load if profile is initialized (prevent premature errors if not logged in)
    if (profile !== undefined) {
      loadNotifications()
    }
  }, [profile])

  const handleMarkAsRead = async (id: string, href: string | null) => {
    const notif = notifications.find(n => n.id === id)
    if (!notif) return

    if (!notif.read_at) {
      // Optimistic update
      const original = [...notifications]
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      
      const success = await markNotificationAsRead(id)
      if (success) {
        window.dispatchEvent(new CustomEvent('habitat:notifications-changed'))
      } else {
        // Revert on failure
        setNotifications(original)
      }
    }

    if (href && href.startsWith('/')) {
      router.push(href)
    }
  }

  const handleMarkAll = async () => {
    const original = [...notifications]
    setNotifications(prev => prev.map(n => n.read_at ? n : { ...n, read_at: new Date().toISOString() }))
    
    const success = await markAllNotificationsAsRead()
    if (success) {
      window.dispatchEvent(new CustomEvent('habitat:notifications-changed'))
    } else {
      // Revert on failure
      setNotifications(original)
    }
  }

  const filtered = useMemo(() => {
    return notifications.filter(item => {
      const matchFilter = activeFilter === 'todas' || item.type === activeFilter
      const matchUnread = !onlyUnread || !item.read_at
      return matchFilter && matchUnread
    })
  }, [notifications, activeFilter, onlyUnread])

  const groups = useMemo(() => {
    const map = new Map<string, Notification[]>()
    for (const item of filtered) {
      const g = formatDateGroup(item.created_at)
      if (!map.has(g)) map.set(g, [])
      map.get(g)!.push(item)
    }
    return Array.from(map.entries())
  }, [filtered])

  const unreadCount = notifications.filter(item => !item.read_at).length
  
  // Calculate dynamic filter counts based on actual data
  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { todas: notifications.length }
    for (const item of notifications) {
      counts[item.type] = (counts[item.type] || 0) + 1
    }
    return counts
  }, [notifications])

  const availableFilters = [
    { key: 'todas', label: 'Todas' },
    { key: 'visit', label: 'Visitas y citas' },
    { key: 'message', label: 'Mensajes y chat' },
    { key: 'favorite', label: 'Precios y favoritos' },
    { key: 'listing', label: 'Alojamientos' },
    { key: 'system', label: 'Sistema' },
  ].filter(f => f.key === 'todas' || filterCounts[f.key] > 0) // only show filters with results, or 'todas'

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
            {!loading && !error && (
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/25 px-3 py-1 text-xs font-black">
                <span className="size-2 rounded-full bg-primary" />
                {unreadCount} no leídas
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              type="button" 
              onClick={handleMarkAll} 
              disabled={loading || unreadCount === 0}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-bold transition hover:bg-primary/20 disabled:opacity-50"
            >
              <CheckCheck size={17} /> Marcar todas como leídas
            </button>
            <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold transition hover:bg-secondary">
              <Settings size={17} /> Configuración de alertas
            </button>
          </div>
        </section>

        {!loading && !error && notifications.length > 0 && (
          <section className="mt-8 rounded-2xl border border-border bg-card p-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {availableFilters.map(filter => (
                  <button 
                    key={filter.key} 
                    type="button" 
                    onClick={() => setActiveFilter(filter.key)} 
                    className={cn('inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition', activeFilter === filter.key ? 'bg-primary text-foreground shadow-sm' : 'bg-background hover:bg-secondary')}
                  >
                    {filter.label}
                    <span className={cn('rounded-full px-2 py-0.5 text-[11px]', activeFilter === filter.key ? 'bg-foreground text-background' : 'bg-secondary text-foreground')}>{filterCounts[filter.key] || 0}</span>
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
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <section className="space-y-9">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 size={40} className="animate-spin text-primary mb-4" />
                <p className="font-semibold">Cargando notificaciones...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-red-500">
                <AlertCircle size={40} className="mb-4" />
                <p className="font-semibold">{error}</p>
              </div>
            ) : notifications.length === 0 ? (
               <div className="py-20 text-center">
                 <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-primary"><Bell size={20} /></span>
                 <h2 className="mt-3 text-lg font-black">No tienes notificaciones</h2>
                 <p className="mt-1 text-sm text-muted-foreground">Aquí aparecerán tus alertas de visitas y mensajes.</p>
               </div>
            ) : filtered.length === 0 ? (
               <div className="py-20 text-center">
                 <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground"><CheckCheck size={20} /></span>
                 <h2 className="mt-3 text-lg font-black">No hay resultados para este filtro</h2>
                 <p className="mt-1 text-sm text-muted-foreground">Intenta cambiar de categoría o ver las leídas.</p>
               </div>
            ) : (
              <>
                {groups.map(([groupName, groupItems]) => (
                  <div key={groupName}>
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-black">{groupName}</h2>
                      <span className="text-xs font-semibold text-muted-foreground">{groupItems.length} actualizaciones</span>
                    </div>
                    <div className="space-y-4">
                      {groupItems.map(item => {
                        const Icon = getIconForType(item.type)
                        const unread = !item.read_at
                        return (
                          <article key={item.id} className={cn('relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md', unread ? 'border-primary/50 bg-primary/10' : 'border-border')}>
                            {unread && <span className="absolute left-0 top-0 h-full w-1 bg-primary" />}
                            <div className="flex gap-4">
                              <div className={cn('relative grid size-12 shrink-0 place-items-center rounded-2xl', unread ? 'bg-primary text-foreground' : 'bg-secondary text-muted-foreground')}>
                                <Icon size={22} />
                                {unread && <span className="absolute -right-1 -top-1 size-3 rounded-full bg-foreground ring-2 ring-card" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-md bg-secondary px-2 py-1 text-[11px] font-black">{getBadgeForType(item.type)}</span>
                                </div>
                                <div className="mt-2 flex items-start justify-between gap-3">
                                  <h3 className="text-lg font-black leading-snug">{item.title}</h3>
                                  <span className="shrink-0 text-xs font-semibold text-muted-foreground">{formatTime(item.created_at)}</span>
                                </div>
                                {item.body && <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>}
                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                  {item.href ? (
                                    <button 
                                      type="button" 
                                      onClick={() => handleMarkAsRead(item.id, item.href)}
                                      className={cn('inline-flex min-h-10 items-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition', unread ? 'bg-primary hover:bg-primary/80' : 'bg-secondary hover:bg-primary/20')}
                                    >
                                      Ver detalles
                                    </button>
                                  ) : null}
                                  {unread && (
                                    <button 
                                      type="button" 
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleMarkAsRead(item.id, null)
                                      }}
                                      className="inline-flex min-h-10 items-center rounded-xl px-3 py-2 text-sm font-bold hover:bg-secondary"
                                    >
                                      Marcar como leída
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </article>
                        )
                      })}
                    </div>
                  </div>
                ))}

                <div className="py-10 text-center">
                  <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-primary"><CheckCheck size={20} /></span>
                  <h2 className="mt-3 font-black">Has revisado todas tus alertas mostradas</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Las notificaciones con más de 30 días se archivan de manera automática.</p>
                </div>
              </>
            )}
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black">Canales de Entrega</h2>
                <Bell size={18} className="text-primary" />
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Recibe alertas críticas de citas y bajas de precio al instante.</p>
              <div className="mt-4 space-y-3">
                {[
                  { icon: Smartphone, label: 'WhatsApp', value: profile?.phone || 'No configurado' },
                  { icon: Mail, label: 'Correo de contacto', value: profile?.email || 'Correo confirmado' },
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
