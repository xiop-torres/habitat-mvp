'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, AtSign, Building2, ChevronDown, GraduationCap } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { cn } from '@/lib/utils'

const universities = [
  'Universidad Católica de Santa María (UCSM - Arequipa)',
  'Universidad Nacional de San Agustín (UNSA)',
  'Universidad Católica San Pablo',
  'Universidad Tecnológica del Perú',
  'Universidad La Salle',
]

export default function StudentRegistration() {
  const router = useRouter()
  const [accepted, setAccepted] = useState(true)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <BrandLogo />
          <nav className="hidden items-center gap-8 text-sm font-bold text-muted-foreground md:flex">
            <Link href="/buscar" className="hover:text-foreground">Buscar</Link>
            <Link href="/universidades" className="hover:text-foreground">Universidades</Link>
            <Link href="/" className="hover:text-foreground">Cómo funciona</Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">¿Ya tienes cuenta?</span>
            <Link href="/login" className="inline-flex min-h-11 items-center rounded-xl border border-border bg-card px-4 py-2 text-sm font-black hover:bg-secondary">Iniciar sesión</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-160px)] max-w-7xl place-items-center px-4 py-14 sm:px-6 lg:px-8">
        <section className="w-full max-w-[540px] overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-foreground/5">
          <div className="flex items-center justify-between gap-4 border-b border-border bg-background px-8 py-6">
            <div className="flex min-w-0 items-center gap-3">
              <GraduationCap className="size-6 text-foreground" />
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-black uppercase tracking-wide">Cuenta de estudiante <span className="size-2 rounded-full bg-primary" /></p>
                <p className="text-xs text-muted-foreground">Paso 2 de 2: completa tus datos básicos</p>
              </div>
            </div>
            <Link href="/registro/propietario" className="shrink-0 text-sm font-black hover:underline">← Cambiar a propietario</Link>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              router.push('/buscar')
            }}
            className="px-8 py-9"
          >
            <h1 className="text-3xl font-black tracking-tight">Crea tu cuenta de estudiante</h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Encuentra habitaciones verificadas y agenda visitas gratuitas sin comisiones.</p>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <Field label="Nombre">
                <input required className="field bg-secondary" defaultValue="Diego" />
              </Field>
              <Field label="Apellido">
                <input required className="field bg-secondary" defaultValue="Rodríguez" />
              </Field>

              <Field label="Correo institucional o personal" className="sm:col-span-2" hint="Recomendado .edu.pe">
                <div className="relative">
                  <AtSign className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                  <input required type="email" className="field bg-secondary pl-12" defaultValue="diego.r@ucsm.edu.pe" />
                </div>
              </Field>

              <Field label="Universidad o instituto" optional="Opcional" hint="Para calcular distancias a pie" className="sm:col-span-2">
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                  <select className="field appearance-none bg-secondary pl-12 pr-12" defaultValue={universities[0]}>
                    {universities.map(university => <option key={university}>{university}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                </div>
              </Field>

              <Field label="Contraseña">
                <input required minLength={8} type="password" className="field bg-secondary" defaultValue="PasswordSegura2024!" />
              </Field>
              <Field label="Confirmar contraseña">
                <input required minLength={8} type="password" className="field bg-secondary" defaultValue="PasswordSegura2024!" />
              </Field>
            </div>

            <div className="mt-6 flex items-center gap-2">
              {[0, 1, 2, 3].map(item => <span key={item} className="h-1.5 flex-1 rounded-full bg-emerald-500" />)}
              <span className="ml-1 whitespace-nowrap text-xs font-black text-emerald-600">Segura y válida</span>
            </div>

            <label className="mt-6 flex items-start gap-3 text-sm leading-6 text-muted-foreground">
              <input required type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)} className="mt-1 size-4 rounded accent-[var(--primary)]" />
              <span>Acepto los Términos y Condiciones de Habitat y la Política de Privacidad para la comunidad universitaria.</span>
            </label>

            <button type="submit" disabled={!accepted} className="mt-7 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-primary px-5 py-3 text-base font-black shadow-lg shadow-primary/20 transition hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-60">
              Crear mi cuenta <ArrowRight size={21} />
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">Serás redirigido directamente al buscador de alojamientos para empezar tu búsqueda.</p>

            <div className="mt-7 border-t border-border pt-5 text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta en Habitat? <Link href="/login" className="font-black text-foreground hover:underline">Inicia sesión</Link>
            </div>
          </form>
        </section>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex min-h-14 max-w-7xl flex-col justify-between gap-3 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p>© 2026 Habitat Perú. Hecho para estudiantes universitarios.</p>
          <div className="flex gap-5">
            <Link href="/mensajes">Ayuda para estudiantes</Link>
            <Link href="/visitas">Seguridad en visitas</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Field({ label, optional, hint, className, children }: { label: string; optional?: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={cn('grid gap-2 text-sm font-black uppercase tracking-wide text-muted-foreground', className)}>
      <span className="flex items-center justify-between gap-3">
        <span>{label} {optional && <span className="font-black text-muted-foreground/70">({optional})</span>}</span>
        {hint && <span className="rounded-lg bg-primary/20 px-2 py-1 text-[11px] normal-case tracking-normal text-foreground">{hint}</span>}
      </span>
      {children}
    </label>
  )
}
