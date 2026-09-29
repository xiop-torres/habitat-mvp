'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Bell, CalendarDays, Check, Heart, Menu, MessageCircle, UserRound, X, Loader2, TriangleAlert } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { PrimaryButton, SecondaryButton } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useCurrentUserProfile, getInitials } from '@/lib/supabase/useProfile'

export function AppHeader({ owner = false }: { owner?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { profile } = useCurrentUserProfile()
  const initials = profile ? getInitials(profile.first_name, profile.last_name) : null
  const displayName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : null
  
  // Prefer real role if available, fallback to prop during initial load
  const isOwnerView = profile ? profile.role === 'owner' : owner

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <BrandLogo compact />
          
          {/* Desktop Nav */}
          <nav className="hidden items-center gap-5 text-sm font-semibold text-muted-foreground md:flex">
            {isOwnerView ? (
              <>
                <Link href="/propietario">Panel</Link>
                <Link href="/buscar">Buscar</Link>
                <Link href="/propietario/solicitudes">Solicitudes</Link>
                <Link href="/mensajes">Mensajes</Link>
              </>
            ) : (
              <>
                <Link href="/buscar">Buscar</Link>
                <Link href="/favoritos">Favoritos</Link>
                <Link href="/visitas">Mis visitas</Link>
                <Link href="/mensajes">Mensajes</Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {!isOwnerView && (
              <Link href="/notificaciones" aria-label="Notificaciones" className="relative grid size-10 place-items-center rounded-full border border-border bg-card transition hover:bg-secondary">
                <Bell size={19} />
                <span className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-black text-foreground ring-2 ring-background">3</span>
              </Link>
            )}
            <Link
              href="/perfil"
              aria-label={displayName ? `Perfil de ${displayName}` : isOwnerView ? 'Perfil de propietario' : 'Perfil de estudiante'}
              title={displayName || 'Mi perfil'}
              className="grid size-10 place-items-center rounded-full bg-primary text-foreground transition hover:bg-primary/80"
            >
              {initials ? (
                <span className="text-xs font-black tracking-tighter">{initials}</span>
              ) : (
                <UserRound size={19} />
              )}
            </Link>
            
            {/* Hamburger (Mobile) */}
            <button
              type="button"
              aria-label="Abrir menú"
              className="grid size-10 place-items-center rounded-full border border-border bg-card transition hover:bg-secondary md:hidden"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={19} />
            </button>

            {/* Desktop CTA */}
            <Link href={isOwnerView ? '/propietario/nuevo' : '/buscar'} className="hidden rounded-xl bg-primary px-4 py-2.5 text-sm font-bold sm:inline-flex">
              {isOwnerView ? 'Publicar' : 'Explorar'}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur md:hidden">
          <div className="flex min-h-16 items-center justify-between border-b border-border px-4 sm:px-6">
            <BrandLogo compact />
            <button
              type="button"
              aria-label="Cerrar menú"
              className="grid size-10 place-items-center rounded-full border border-border bg-card transition hover:bg-secondary"
              onClick={() => setMenuOpen(false)}
            >
              <X size={19} />
            </button>
          </div>
          <nav className="flex flex-col gap-6 p-6 text-lg font-bold">
            {isOwnerView ? (
              <>
                <Link href="/propietario" onClick={() => setMenuOpen(false)}>Panel</Link>
                <Link href="/buscar" onClick={() => setMenuOpen(false)}>Buscar</Link>
                <Link href="/propietario/solicitudes" onClick={() => setMenuOpen(false)}>Solicitudes</Link>
                <Link href="/mensajes" onClick={() => setMenuOpen(false)}>Mensajes</Link>
                <Link href="/propietario/nuevo" onClick={() => setMenuOpen(false)} className="mt-4 text-primary">Publicar alojamiento</Link>
              </>
            ) : (
              <>
                <Link href="/buscar" onClick={() => setMenuOpen(false)}>Buscar</Link>
                <Link href="/favoritos" onClick={() => setMenuOpen(false)}>Favoritos</Link>
                <Link href="/visitas" onClick={() => setMenuOpen(false)}>Mis visitas</Link>
                <Link href="/mensajes" onClick={() => setMenuOpen(false)}>Mensajes</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </>
  )
}

export function Footer() {
  return <footer className="mt-16 border-t border-border bg-secondary/50"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-8"><div><BrandLogo compact /><p className="mt-3 text-sm leading-6 text-muted-foreground">Tu espacio, más cerca. Encuentra alojamiento cerca de tu universidad.</p></div><div><h2 className="text-sm font-bold">Descubre</h2><div className="mt-3 grid gap-2 text-sm text-muted-foreground"><Link href="/buscar">Buscar alojamiento</Link><Link href="/">Cómo funciona</Link></div></div><div><h2 className="text-sm font-bold">Propietarios</h2><div className="mt-3 grid gap-2 text-sm text-muted-foreground"><Link href="/propietario/nuevo">Publicar alojamiento</Link><Link href="/propietario">Mi panel</Link></div></div><div><h2 className="text-sm font-bold">Contacto</h2><p className="mt-3 text-sm text-muted-foreground">Arequipa, Perú<br />hola@habitat.pe</p></div></div><p className="border-t border-border px-5 py-5 text-center text-xs text-muted-foreground">© 2026 Habitat. Hecho para estudiantes.</p></footer>
}

export function EmptyState({ icon = '♡', title, copy, action, href }: { icon?: string; title: string; copy: string; action: string; href: string }) {
  return <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center"><span className="mx-auto grid size-14 place-items-center rounded-full bg-primary/15 text-2xl text-primary">{icon}</span><h2 className="mt-5 text-xl font-bold">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{copy}</p><Link href={href} className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-primary px-5 py-3 text-sm font-bold">{action}</Link></div>
}

export function FilterPill({ children, active = false, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return <button type="button" onClick={onClick} className={cn('min-h-10 rounded-full border px-4 py-2 text-sm font-semibold transition', active ? 'border-primary bg-primary' : 'border-border bg-card hover:bg-secondary')}>{children}</button>
}

import { useRouter } from 'next/navigation';
import { createVisitRequest, type VisitMode } from '@/lib/supabase/visits';

export function VisitRequestModal({ open, onClose, onSubmitted, listingId }: { open: boolean; onClose: () => void; onSubmitted: (msg: string) => void; listingId?: string }) {
  const router = useRouter();
  const [shift, setShift] = useState('Mañana – 9:00 - 12:00');
  const [date, setDate] = useState('');
  const [mode, setMode] = useState<VisitMode>('presencial');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  async function handleSubmit() {
    if (!listingId) return;
    if (!date) {
      setError('Por favor selecciona una fecha.');
      return;
    }
    setLoading(true);
    setError('');
    const { success, error: reqError } = await createVisitRequest({
      listingId,
      requestedDate: date,
      requestedTime: shift,
      mode,
      message
    });
    setLoading(false);
    if (success) {
      onSubmitted('Solicitud de visita enviada correctamente.');
    } else {
      if (reqError === 'No autorizado') {
        router.push('/login');
        onClose();
      } else {
        setError(reqError || 'Ocurrió un error inesperado.');
      }
    }
  }

  return <div role="dialog" aria-modal="true" aria-labelledby="visit-title" className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4">
    <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-card p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Solicitar visita</p>
          <h2 id="visit-title" className="mt-1 text-xl font-bold">Conoce tu próximo espacio</h2>
        </div>
        <button type="button" aria-label="Cerrar" onClick={onClose} disabled={loading} className="grid size-10 place-items-center rounded-full hover:bg-secondary">
          <X size={18} />
        </button>
      </div>
      <div className="mt-6 grid gap-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-sm font-semibold text-destructive">
            <TriangleAlert size={18} /> {error}
          </div>
        )}
        <label className="grid gap-2 text-sm font-semibold">
          Día
          <input type="date" className="field" min={todayStr} value={date} onChange={e => setDate(e.target.value)} disabled={loading} />
        </label>
        <div>
          <p className="mb-2 text-sm font-semibold">Turno</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {['Mañana – 9:00 - 12:00', 'Tarde – 14:00 - 18:00', 'Noche – 18:00 - 20:00'].map(item => (
              <button type="button" key={item} disabled={loading} onClick={() => setShift(item)} className={cn('rounded-xl border px-3 py-3 text-left text-xs font-semibold transition-colors', shift === item ? 'border-primary bg-primary/20' : 'border-border hover:bg-secondary/50')}>
                {item}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Modalidad</p>
          <div className="grid grid-cols-2 gap-2">
            {(['presencial', 'virtual'] as const).map(m => (
              <button type="button" key={m} disabled={loading} onClick={() => setMode(m)} className={cn('rounded-xl border px-3 py-3 text-center text-sm font-semibold capitalize transition-colors', mode === m ? 'border-primary bg-primary/20' : 'border-border hover:bg-secondary/50')}>
                {m}
              </button>
            ))}
          </div>
        </div>
        <label className="grid gap-2 text-sm font-semibold">
          Mensaje
          <textarea className="field min-h-24 resize-none" placeholder="Cuéntale algo al propietario (opcional)" value={message} onChange={e => setMessage(e.target.value)} disabled={loading} />
        </label>
        <PrimaryButton onClick={handleSubmit} disabled={loading} className="w-full h-12 mt-2">
          {loading ? <Loader2 className="mx-auto animate-spin" size={20} /> : 'Enviar solicitud'}
        </PrimaryButton>
      </div>
    </div>
  </div>
}

export function Toast({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  return <div role="status" className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background shadow-xl"><Check size={17} className="text-primary" />{children}{onClose && <button type="button" aria-label="Cerrar aviso" onClick={onClose}><X size={15} /></button>}</div>
}

export function QuickLinks({ owner = false }: { owner?: boolean }) {
  return <div className="grid grid-cols-3 gap-3"><Link href={owner ? '/propietario/solicitudes' : '/visitas'} className="rounded-xl border border-border bg-card p-4 text-center text-sm font-semibold"><CalendarDays className="mx-auto mb-2 text-primary" size={20} />{owner ? 'Solicitudes' : 'Mis visitas'}</Link><Link href="/mensajes" className="rounded-xl border border-border bg-card p-4 text-center text-sm font-semibold"><MessageCircle className="mx-auto mb-2 text-primary" size={20} />Mensajes</Link><Link href="/favoritos" className="rounded-xl border border-border bg-card p-4 text-center text-sm font-semibold"><Heart className="mx-auto mb-2 text-primary" size={20} />Favoritos</Link></div>
}
