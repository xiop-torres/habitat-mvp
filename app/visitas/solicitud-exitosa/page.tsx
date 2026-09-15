import Link from 'next/link'
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Home,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Star,
  Wifi,
  Zap,
} from 'lucide-react'
import { AppHeader, Footer } from '@/components/Shared'

const tips = [
  ['Lleva tu carné universitario', 'O constancia de matrícula UCSM para validar tu condición de estudiante y acelerar el contrato.'],
  ['Puntualidad estudiantil', 'Llega 5 minutos antes al timbre de la puerta principal de Calle Cortaderas 214.'],
  ['Prueba la conectividad', 'Don Carlos te facilitará la contraseña para hacer un test de velocidad y latencia en vivo.'],
  ['Sin compromisos ni pagos previos', 'Nunca entregues dinero ni señas en efectivo antes de inspeccionar y firmar tu contrato.'],
]

export default function VisitRequestSuccessPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-32 top-0 size-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 top-60 size-96 rounded-full bg-emerald-200/45 blur-3xl" />

        <section className="relative mx-auto max-w-5xl px-4 pb-16 pt-10 text-center sm:px-6 lg:px-8">
          <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-emerald-700 text-white shadow-sm ring-8 ring-emerald-100">
            <CheckCircle2 size={42} />
          </div>
          <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-bold text-muted-foreground">
            <span className="size-2 rounded-full bg-emerald-600" />
            CÓDIGO DE RESERVA:
            <span className="text-foreground">#VIS-8492</span>
          </div>
          <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            ¡Tu solicitud de visita ha sido enviada con éxito!
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-7 text-muted-foreground">
            <strong className="text-foreground">Don Carlos</strong> ha recibido tu solicitud. Te responderá en breve, con tiempo promedio menor a <strong className="text-yellow-700">15 minutos</strong>.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Visita+Habitaci%C3%B3n+Habitat+-+Yanahuara" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold shadow-sm hover:bg-primary-hover">
              <CalendarDays size={17} />
              Agregar a Google Calendar
            </a>
            <a href="https://wa.me/51958432812?text=Hola%20Don%20Carlos,%20acabo%20de%20solicitar%20la%20visita%20%23VIS-8492%20por%20Habitat." target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-card px-5 py-3 text-sm font-bold shadow-sm ring-1 ring-border hover:bg-secondary">
              <MessageSquare size={17} className="text-emerald-700" />
              Enviar detalles a mi WhatsApp
            </a>
            <Link href="/mensajes" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-secondary px-5 py-3 text-sm font-bold text-muted-foreground hover:text-foreground">
              <MessageSquare size={17} />
              Chat con Don Carlos
            </Link>
          </div>
        </section>

        <section className="relative mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 pb-14 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="space-y-6 lg:col-span-8">
            <article className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CalendarDays size={24} className="text-yellow-700" />
                  <h2 className="text-xl font-bold">Visita Presencial</h2>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                  <span className="size-2 rounded-full bg-emerald-600" />
                  Confirmación en proceso
                </span>
              </div>

              <div className="mt-5 grid gap-4 rounded-2xl bg-secondary p-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Fecha y horario</p>
                  <p className="mt-2 text-lg font-bold">Sábado 19 de octubre, 2024</p>
                  <p className="mt-1 text-sm font-bold text-yellow-700">11:30 AM - 12:00 PM (Hora estándar Perú)</p>
                </div>
                <div className="rounded-xl bg-card p-3 text-left md:text-right">
                  <p className="text-xs font-bold text-muted-foreground">Tiempo restante</p>
                  <p className="mt-1 text-xl font-bold text-emerald-700">2h 15m</p>
                  <p className="text-xs font-medium text-muted-foreground">Sincronizado</p>
                </div>
              </div>

              <div className="mt-6 flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-orange-100 text-yellow-700"><MapPin size={20} /></span>
                <div>
                  <p className="font-bold">Calle Cortaderas 214, Yanahuara, Arequipa</p>
                  <p className="mt-1 text-sm font-medium leading-6 text-muted-foreground">Referencia: Frente al Parque Libertad de Expresión · A solo 8 min a pie de UCSM Campus Central</p>
                </div>
              </div>

              <div className="relative mt-5 h-44 overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-200 to-zinc-500">
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-foreground/80 to-transparent p-4 text-background">
                  <span className="flex items-center gap-2 text-sm font-bold">650 m de la puerta 2 UCSM</span>
                  <a href="https://maps.google.com/?q=Yanahuara+Arequipa+UCSM" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-xl bg-card px-3 py-2 text-xs font-bold text-foreground">
                    Ver ruta exacta
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Alojamiento a inspeccionar</p>
                <div className="mt-3 flex flex-col gap-4 rounded-2xl bg-secondary p-3 sm:flex-row">
                  <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-xl sm:w-48">
                    <img src="/habitat-room.png" alt="Habitación a visitar" className="h-full w-full object-cover" />
                    <span className="absolute left-2 top-2 rounded-lg bg-emerald-700 px-2 py-1 text-xs font-bold text-white">Verificado</span>
                  </div>
                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold">Habitación Individual Yanahuara Premier</h3>
                        <p className="mt-1 text-sm font-medium text-muted-foreground">Habitación con baño privado, entrada independiente y closet empotrado.</p>
                      </div>
                      <p className="text-2xl font-bold">S/ 650 <span className="text-xs font-medium text-muted-foreground">/ mes</span></p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Wifi size={14} className="text-yellow-700" />WiFi 200 Mbps</span>
                      <span className="inline-flex items-center gap-1"><ShieldCheck size={14} className="text-yellow-700" />Agua caliente solar</span>
                      <span className="inline-flex items-center gap-1"><Zap size={14} className="text-yellow-700" />Luz incluida</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-orange-100 text-yellow-700"><CheckCircle2 size={21} /></span>
                  <h2 className="text-xl font-bold">Qué tener en cuenta para tu visita presencial</h2>
                </div>
                <span className="text-xs font-bold text-yellow-700">Consejos Habitat</span>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {tips.map(([title, copy], index) => (
                  <div key={title} className="flex gap-3 rounded-2xl bg-secondary p-4">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold">{index + 1}</span>
                    <div>
                      <h3 className="text-sm font-bold">{title}</h3>
                      <p className="mt-1 text-xs font-medium leading-5 text-muted-foreground">{copy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <article className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Tu arrendador</p>
              <div className="mt-4 flex items-center gap-4">
                <div className="grid size-16 place-items-center rounded-full bg-secondary text-lg font-bold">CM</div>
                <div>
                  <h2 className="text-lg font-bold">Don Carlos M.</h2>
                  <p className="text-xs font-bold text-emerald-700">Propietario Verificado Habitat</p>
                  <p className="mt-1 flex items-center gap-1 text-xs font-medium"><Star size={14} className="fill-primary text-primary" />4.9 (38 opiniones)</p>
                </div>
              </div>
              <div className="mt-5 rounded-2xl bg-secondary p-4 text-sm">
                <div className="flex justify-between gap-3"><span className="font-bold text-muted-foreground">Tiempo de respuesta:</span><span className="font-bold">&lt; 15 min</span></div>
                <div className="mt-2 flex justify-between gap-3"><span className="font-bold text-muted-foreground">Alojando desde:</span><span className="font-bold">Marzo 2021</span></div>
                <div className="mt-2 flex justify-between gap-3"><span className="font-bold text-muted-foreground">Estudiantes UCSM:</span><span className="font-bold">14 alumnos</span></div>
              </div>
              <div className="mt-5">
                <p className="text-xs font-bold text-muted-foreground">Tu mensaje enviado:</p>
                <p className="mt-2 rounded-2xl bg-secondary p-3 text-sm italic leading-6 text-muted-foreground">“Hola Don Carlos, busco mudarme para el ciclo 2024-II. Me gustaría revisar la ventilación y el escritorio.”</p>
              </div>
              <a href="https://wa.me/51958432812" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-800">
                <MessageSquare size={17} />
                Contactar por WhatsApp
              </a>
            </article>

            <article className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <ShieldCheck size={22} className="text-yellow-700" />
                <h2 className="text-lg font-bold">Garantía Habitat Perú</h2>
              </div>
              <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">Esta propiedad fue inspeccionada presencialmente por el equipo de Habitat Arequipa. Si el espacio no coincide con las fotos durante tu visita, te reubicamos de inmediato.</p>
              <p className="mt-4 text-xs font-bold text-emerald-700">Soporte estudiantil activo: (054) 382-910</p>
            </article>
          </aside>
        </section>

        <section className="relative mx-auto flex max-w-5xl flex-col gap-4 px-4 pb-20 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link href="/visitas" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-secondary px-5 py-3 text-sm font-bold hover:bg-border">
            <CalendarDays size={17} />
            Ir a Mis Visitas Agendadas
          </Link>
          <Link href="/buscar" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold hover:bg-primary-hover">
            Seguir explorando habitaciones cerca de UCSM
            <Home size={17} />
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  )
}
