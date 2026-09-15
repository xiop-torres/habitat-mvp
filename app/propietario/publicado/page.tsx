import Link from 'next/link'
import { CheckCircle2, Eye, Share2 } from 'lucide-react'
import { AppHeader, Footer } from '@/components/Shared'

export default function PublishedListingPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader owner />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-primary text-foreground"><CheckCircle2 size={40} /></div>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">Publicación activa</p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">¡Tu alojamiento ya está visible!</h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">Los estudiantes cerca de tu universidad ya pueden encontrar tu espacio y solicitar una visita.</p>
        </div>

        <section className="mx-auto mt-9 grid max-w-4xl gap-6 rounded-3xl border border-border bg-card p-5 shadow-sm sm:grid-cols-[220px_1fr] sm:p-6">
          <img src="/habitat-room.png" alt="Alojamiento publicado" className="h-52 w-full rounded-2xl object-cover sm:h-full" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">Activo y visible</span>
              <span className="rounded-full bg-primary/25 px-3 py-1 text-xs font-black">Verificado Habitat</span>
            </div>
            <h2 className="mt-4 text-xl font-black">Habitación privada amoblada cerca de la UCSM</h2>
            <p className="mt-2 text-sm text-muted-foreground">Yanahuara, Arequipa · A 1.2 km del campus</p>
            <p className="mt-4 text-2xl font-black">S/ 650 <span className="text-xs font-normal text-muted-foreground">/ mes</span></p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-black"><Share2 size={16} /> Compartir publicación</button>
              <Link href="/alojamiento/1" className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-bold"><Eye size={16} /> Ver ficha pública</Link>
            </div>
          </div>
        </section>

        <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-3">
          {[
            ['1', 'Recibirás solicitudes'],
            ['2', 'Responderemos consultas'],
            ['3', 'Gestiona tus visitas'],
          ].map(([number, text]) => (
            <div key={number} className="rounded-2xl border border-border bg-secondary p-5">
              <span className="grid size-8 place-items-center rounded-full bg-primary text-sm font-black">{number}</span>
              <p className="mt-3 text-sm font-black">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link href="/propietario" className="rounded-xl bg-foreground px-5 py-3 text-sm font-black text-background">Ir al panel del propietario</Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
