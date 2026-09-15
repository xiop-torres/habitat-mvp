'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, AtSign, Home, KeyRound, Phone } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { cn } from '@/lib/utils'

export default function OwnerRegistration() {
  const router = useRouter()
  const [accepted, setAccepted] = useState(true)

  return (
    <div className="min-h-screen bg-secondary/35 text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <BrandLogo />
          <nav className="hidden items-center gap-8 text-sm font-bold text-muted-foreground md:flex">
            <Link href="/propietario" className="hover:text-foreground">Beneficios Propietarios</Link>
            <Link href="/propietario/publicado" className="hover:text-foreground">Garantía y Contratos</Link>
            <Link href="/propietario/nuevo" className="hover:text-foreground">Calculadora de Renta</Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">¿Ya eres anfitrión?</span>
            <Link href="/login" className="inline-flex min-h-11 items-center rounded-xl border border-border bg-card px-4 py-2 text-sm font-black hover:bg-secondary">Iniciar sesión</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-160px)] max-w-7xl place-items-center px-4 py-14 sm:px-6 lg:px-8">
        <section className="w-full max-w-[540px] overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-foreground/5">
          <div className="flex items-center justify-between gap-4 border-b border-border bg-background px-8 py-6">
            <div className="flex min-w-0 items-center gap-3">
              <Home className="size-6 text-foreground" />
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-black uppercase tracking-wide">Cuenta de propietario / arrendador <span className="size-2 rounded-full bg-primary" /></p>
                <p className="text-xs text-muted-foreground">Paso 2 de 2: registra tus datos para publicar habitaciones</p>
              </div>
            </div>
            <Link href="/registro/estudiante" className="shrink-0 text-sm font-black hover:underline">← Cambiar a estudiante</Link>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              router.push('/propietario/nuevo')
            }}
            className="px-8 py-9"
          >
            <h1 className="text-3xl font-black tracking-tight">Registra tu cuenta de propietario</h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Conecta con estudiantes universitarios verificados y llena tus vacantes en tiempo récord.</p>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <Field label="Nombre">
                <input required className="field bg-secondary" defaultValue="Carlos" />
              </Field>
              <Field label="Apellido">
                <input required className="field bg-secondary" defaultValue="Morales" />
              </Field>

              <Field label="Correo electrónico" className="sm:col-span-2">
                <div className="relative">
                  <AtSign className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                  <input required type="email" className="field bg-secondary pl-12" defaultValue="carlos.morales@gmail.com" />
                </div>
              </Field>

              <Field label="Teléfono / WhatsApp de contacto" hint="Para avisos de visitas" className="sm:col-span-2">
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                  <input required type="tel" className="field bg-secondary pl-12" defaultValue="+51 954 120 488" />
                </div>
              </Field>

              <Field label="Contraseña">
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                  <input required minLength={8} type="password" className="field bg-secondary pl-12" defaultValue="PropietarioSeguro2026!" />
                </div>
              </Field>
              <Field label="Confirmar contraseña">
                <input required minLength={8} type="password" className="field bg-secondary" defaultValue="PropietarioSeguro2026!" />
              </Field>
            </div>

            <label className="mt-6 flex items-start gap-3 text-sm leading-6 text-muted-foreground">
              <input required type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)} className="mt-1 size-4 rounded accent-[var(--primary)]" />
              <span>Acepto los Términos y Condiciones para Arrendadores y las políticas de convivencia estudiantil de Habitat.</span>
            </label>

            <button type="submit" disabled={!accepted} className="mt-7 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-primary px-5 py-3 text-base font-black shadow-lg shadow-primary/20 transition hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-60">
              Crear cuenta de propietario <ArrowRight size={21} />
            </button>
            <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">Al registrarte entrarás a la pantalla de bienvenida para publicar tu primer alojamiento en 9 sencillos pasos.</p>

            <div className="mt-7 border-t border-border pt-5 text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta como propietario? <Link href="/login" className="font-black text-foreground hover:underline">Inicia sesión</Link>
            </div>
          </form>
        </section>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex min-h-14 max-w-7xl flex-col justify-between gap-3 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p>© 2026 Habitat Perú. Plataforma para arrendadores verificados.</p>
          <div className="flex gap-5">
            <Link href="/propietario/publicado">Garantía anti-morosidad</Link>
            <Link href="/mensajes">Soporte a anfitriones</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Field({ label, hint, className, children }: { label: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={cn('grid gap-2 text-sm font-black uppercase tracking-wide text-muted-foreground', className)}>
      <span className="flex items-center justify-between gap-3">
        <span>{label}</span>
        {hint && <span className="rounded-lg bg-emerald-100 px-2 py-1 text-[11px] normal-case tracking-normal text-emerald-700">{hint}</span>}
      </span>
      {children}
    </label>
  )
}
