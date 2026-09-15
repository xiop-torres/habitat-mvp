import Link from 'next/link'
import { ArrowRight, Check, Eye, ShieldCheck, Users } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { Footer } from '@/components/Shared'

export default function Owners() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-5 lg:px-8">
          <BrandLogo compact />
          <div className="flex items-center gap-2">
            <Link href="/" className="hidden rounded-xl px-4 py-2 text-sm font-semibold hover:bg-secondary sm:inline-flex">Volver al inicio</Link>
            <Link href="/login" className="rounded-xl border border-border px-4 py-2 text-sm font-bold hover:bg-secondary">Iniciar sesión</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1fr_420px] lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-black text-primary">Para propietarios</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Publica tu alojamiento y llega a estudiantes que buscan dónde vivir.</h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">Habitat organiza tus solicitudes, mensajes y visitas para que puedas administrar tus vacantes con estudiantes verificados de Arequipa y Lima.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/registro/propietario" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-black">Crear cuenta de propietario <ArrowRight size={17} /></Link>
              <Link href="/propietario" className="inline-flex min-h-12 items-center rounded-xl border border-border px-6 py-3 text-sm font-bold">Ver panel demo</Link>
            </div>
          </div>

          <aside className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-black">Qué tendrás en el panel</h2>
            <div className="mt-5 space-y-3">
              {['Gestión de alojamientos activos y pausados', 'Solicitudes de visita con estudiantes verificados', 'Mensajes seguros y recordatorios', 'Publicación guiada con fotos, servicios y reglas'].map(item => (
                <p key={item} className="flex items-start gap-3 text-sm font-semibold leading-6 text-muted-foreground"><Check className="mt-0.5 size-4 shrink-0 text-emerald-600" /> {item}</p>
              ))}
            </div>
          </aside>
        </section>

        <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-16 sm:grid-cols-3 lg:px-8">
          {[
            ['Público específico', 'Llega a estudiantes que buscan cerca de su universidad.', Users],
            ['Publicación organizada', 'Muestra precio, servicios, fotos y ubicación con claridad.', Eye],
            ['Más confianza', 'Perfiles y alojamientos verificados manualmente.', ShieldCheck],
          ].map(([title, copy, Icon]) => {
            const FeatureIcon = Icon as typeof Users
            return (
              <article key={title as string} className="rounded-2xl border border-border bg-card p-6">
                <FeatureIcon className="text-primary" />
                <h2 className="mt-8 text-xl font-bold">{title as string}</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy as string}</p>
              </article>
            )
          })}
        </section>
      </main>

      <Footer />
    </div>
  )
}
