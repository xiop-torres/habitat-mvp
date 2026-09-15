'use client'

import Link from 'next/link'
import { GraduationCap, Home, ShieldCheck } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'

export default function Register() {
  return (
    <div className="min-h-screen bg-secondary/40">
      <main className="mx-auto min-h-[calc(100vh-74px)] max-w-5xl px-5 py-8">
        <BrandLogo />
        <section className="mx-auto max-w-3xl py-16 text-center">
          <p className="text-sm font-semibold text-foreground">Bienvenido a Habitat</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">¿Cómo quieres usar Habitat?</h1>
          <p className="mt-4 text-muted-foreground">Elige tu rol para crear una cuenta.</p>
          <div className="mt-10 grid gap-5 text-left sm:grid-cols-2">
            <Link href="/registro/estudiante" className="group rounded-3xl border border-border bg-background p-7 transition hover:-translate-y-1 hover:border-primary hover:shadow-lg">
              <span className="grid size-14 place-items-center rounded-2xl bg-primary/20 text-primary"><GraduationCap size={28} /></span>
              <h2 className="mt-7 text-xl font-bold">Soy estudiante</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Encuentra un lugar cerca de tu universidad, compara opciones y coordina una visita.</p>
              <span className="mt-6 block text-sm font-semibold">Crear cuenta de estudiante →</span>
            </Link>
            <Link href="/registro/propietario" className="group rounded-3xl border border-border bg-background p-7 transition hover:-translate-y-1 hover:border-primary hover:shadow-lg">
              <span className="grid size-14 place-items-center rounded-2xl bg-primary/20 text-primary"><Home size={28} /></span>
              <h2 className="mt-7 text-xl font-bold">Soy propietario</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Publica tu alojamiento y llega a estudiantes que buscan dónde vivir.</p>
              <span className="mt-6 block text-sm font-semibold">Publicar alojamiento →</span>
            </Link>
          </div>
          <p className="mt-8 text-sm text-muted-foreground"><ShieldCheck size={15} className="mr-1 inline" /> Tus datos están protegidos y nunca compartimos información sensible.</p>
        </section>
      </main>
      <footer className="border-t border-border bg-card px-5 py-5 text-center text-xs text-muted-foreground">© 2026 Habitat. Registro para estudiantes y propietarios.</footer>
    </div>
  )
}
