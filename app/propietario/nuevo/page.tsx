'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  Home,
  ImagePlus,
  MapPin,
  MessageCircle,
  Share2,
  ShieldCheck,
  X,
} from 'lucide-react'
import { AppHeader, Footer } from '@/components/Shared'
import { cn } from '@/lib/utils'

const steps = ['Tipo', 'Ubicación', 'Universidad', 'Precio', 'Servicios', 'Fotos', 'Plazos', 'Reglas', 'Vista previa']
const stepTitles = [
  '¿Qué tipo de espacio publicarás?',
  '¿Dónde está ubicado?',
  '¿Qué campus queda más cerca?',
  'Define precio y condiciones',
  'Selecciona los servicios incluidos',
  'Agrega fotos del alojamiento',
  'Define disponibilidad y estancia',
  'Establece reglas de convivencia',
  'Revisa antes de publicar',
]

export default function NewPropertyPage() {
  const [step, setStep] = useState(0)
  const [published, setPublished] = useState(false)
  const [propertyType, setPropertyType] = useState('Habitación individual amoblada')
  const [university, setUniversity] = useState('UCSM')
  const [price, setPrice] = useState('650')
  const [services, setServices] = useState(['WiFi 200 Mbps', 'Baño privado', 'Escritorio de estudio', 'Agua caliente 24/7'])
  const shareUrl = 'https://habitat.pe/alojamiento/yanahuara-ucsm-650'

  function toggleService(service: string) {
    setServices(current => current.includes(service) ? current.filter(item => item !== service) : [...current, service])
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader owner />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/propietario" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground">
            <ArrowLeft size={16} />
            Volver al panel
          </Link>
          <span className="text-xs font-bold text-muted-foreground">Borrador guardado automáticamente</span>
        </div>

        <div className="mt-7 overflow-x-auto pb-2">
          <div className="flex min-w-[720px] gap-2">
            {steps.map((item, index) => (
              <button
                type="button"
                key={item}
                onClick={() => index <= step && setStep(index)}
                className={cn(
                  'flex min-w-[72px] flex-1 items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold',
                  index === step ? 'bg-primary text-foreground' : index < step ? 'bg-emerald-100 text-emerald-700' : 'bg-card text-zinc-400 ring-1 ring-border',
                )}
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/80 text-[10px]">{index < step ? <Check size={13} /> : index + 1}</span>
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_340px]">
          <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-yellow-700">Paso {step + 1} de 9</p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{stepTitles[step]}</h1>
            <p className="mt-2 text-sm text-muted-foreground">Completa la información para que los estudiantes entiendan tu espacio con claridad.</p>

            <div className="mt-8">
              {step === 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {['Habitación individual amoblada', 'Habitación compartida', 'Mini departamento', 'Casa / residencia'].map(type => (
                    <button type="button" key={type} onClick={() => setPropertyType(type)} className={cn('rounded-2xl border p-5 text-left', propertyType === type ? 'border-primary bg-primary/20' : 'border-border bg-secondary')}>
                      <Home className="text-yellow-700" size={21} />
                      <p className="mt-4 font-bold">{type}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Ideal para estudiantes universitarios</p>
                    </button>
                  ))}
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-bold">Distrito<input className="field" defaultValue="Yanahuara" /></label>
                  <label className="grid gap-2 text-sm font-bold">Referencia<input className="field" defaultValue="Calle Cortaderas 214" /></label>
                  <div className="flex items-start gap-3 rounded-xl bg-secondary p-4 text-sm text-muted-foreground sm:col-span-2">
                    <MapPin className="shrink-0 text-yellow-700" size={19} />
                    La dirección exacta solo se mostrará después de confirmar una visita.
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-3">
                  {['UCSM', 'UNSA', 'Universidad Católica San Pablo', 'UTP'].map(item => (
                    <button type="button" key={item} onClick={() => setUniversity(item)} className={cn('flex items-center justify-between rounded-xl border p-4 text-left text-sm font-bold', university === item ? 'border-primary bg-primary/20' : 'border-border bg-secondary')}>
                      <span>{item}</span>
                      {university === item && <Check size={17} />}
                    </button>
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-bold">Precio mensual<input className="field text-2xl font-bold" type="number" value={price} onChange={event => setPrice(event.target.value)} /></label>
                  <label className="grid gap-2 text-sm font-bold">Garantía<select className="field"><option>S/ 300</option><option>S/ 650</option><option>Sin garantía</option></select></label>
                  <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 sm:col-span-2"><ShieldCheck className="mr-2 inline" size={17} />Precio competitivo para alojamientos cerca de tu campus.</div>
                </div>
              )}

              {step === 4 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {['WiFi 200 Mbps', 'Baño privado', 'Escritorio de estudio', 'Agua caliente 24/7', 'Cocina equipada', 'Lavandería / tendal', 'Bicicleta', 'Acepta mascotas'].map(service => (
                    <button type="button" key={service} onClick={() => toggleService(service)} className={cn('flex items-center justify-between rounded-xl border p-4 text-left text-sm font-bold', services.includes(service) ? 'border-primary bg-primary/20' : 'border-border bg-card')}>
                      <span>{service}</span>
                      {services.includes(service) ? <Check size={17} className="text-yellow-700" /> : <span className="text-zinc-400">+</span>}
                    </button>
                  ))}
                </div>
              )}

              {step === 5 && (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="relative overflow-hidden rounded-2xl"><img src="/habitat-room.png" alt="Foto principal" className="h-48 w-full object-cover" /><span className="absolute left-2 top-2 rounded bg-primary px-2 py-1 text-[10px] font-bold">Portada</span></div>
                  <div className="overflow-hidden rounded-2xl"><img src="/habitat-hero.png" alt="Zona de estudio" className="h-48 w-full object-cover" /></div>
                  <button type="button" className="grid min-h-48 place-items-center rounded-2xl border-2 border-dashed border-zinc-300 bg-secondary text-sm font-bold"><ImagePlus className="mb-2 text-yellow-700" />Subir foto</button>
                </div>
              )}

              {step === 6 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-bold">Disponible desde<input className="field" type="date" defaultValue="2024-11-01" /></label>
                  <label className="grid gap-2 text-sm font-bold">Estancia mínima<select className="field"><option>4 meses</option><option>6 meses</option><option>12 meses</option></select></label>
                  <div className="rounded-xl bg-secondary p-4 text-sm text-muted-foreground sm:col-span-2">Puedes actualizar disponibilidad y fechas desde tu panel después de publicar.</div>
                </div>
              )}

              {step === 7 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {['Prohibido fumar', 'No se permiten mascotas', 'Visitas con aviso previo', 'Horario de silencio 10:30 PM - 7:00 AM'].map(rule => (
                    <label key={rule} className="flex items-center gap-3 rounded-xl border border-border bg-secondary p-4 text-sm font-bold"><input type="checkbox" defaultChecked className="size-4" />{rule}</label>
                  ))}
                </div>
              )}

              {step === 8 && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-secondary p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-yellow-700">Vista previa</p>
                    <h2 className="mt-3 text-2xl font-bold">{propertyType} cerca de la {university}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">Yanahuara, Arequipa · 1.2 km del campus</p>
                    <p className="mt-4 text-3xl font-bold">S/ {price} <span className="text-xs font-normal text-muted-foreground">/ mes</span></p>
                    <div className="mt-4 flex flex-wrap gap-2">{services.map(item => <span key={item} className="rounded-full bg-card px-3 py-1 text-xs font-bold">{item}</span>)}</div>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"><Check className="mr-2 inline" size={16} />Todo listo. Al publicar, tu alojamiento quedará visible para estudiantes.</div>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-between">
              <button type="button" onClick={() => setStep(current => Math.max(0, current - 1))} disabled={step === 0} className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-bold disabled:opacity-40">Paso anterior</button>
              {step < steps.length - 1 ? (
                <button type="button" onClick={() => setStep(current => current + 1)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold">Continuar al paso {step + 2} <ArrowRight size={16} /></button>
              ) : (
                <button type="button" onClick={() => setPublished(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold">Publicar alojamiento <CheckCircle2 size={17} /></button>
              )}
            </div>
          </section>

          <aside className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <img src="/habitat-room.png" alt="Vista previa del alojamiento" className="h-56 w-full object-cover" />
              <div className="p-5">
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">Vista previa en tiempo real</span>
                <h2 className="mt-4 font-bold">{propertyType}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{university} · Yanahuara</p>
                <p className="mt-4 text-2xl font-bold">S/ {price}<span className="text-xs font-normal text-muted-foreground"> / mes</span></p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-bold">Consejo Habitat</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Las publicaciones con fotos claras, precio visible y distancia al campus reciben más solicitudes.</p>
            </div>
          </aside>
        </div>
      </main>

      {published && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-foreground/65 p-4 backdrop-blur-sm">
          <section className="relative my-8 w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-card p-5 text-center shadow-2xl sm:p-8">
            <div className="pointer-events-none absolute -left-16 -top-16 size-44 rounded-full bg-primary/60 blur-3xl" />
            <div className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-emerald-200/70 blur-3xl" />
            <button type="button" aria-label="Cerrar confirmación" onClick={() => setPublished(false)} className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"><X size={20} /></button>

            <div className="relative z-10">
              <span className="mx-auto inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700"><CheckCircle2 size={15} />¡Enhorabuena, Carlos!</span>
              <div className="mx-auto mt-4 grid size-20 place-items-center rounded-full bg-emerald-100 text-emerald-700 ring-8 ring-emerald-50"><CheckCircle2 size={42} /></div>
              <h2 className="mx-auto mt-5 max-w-xl text-2xl font-bold leading-tight sm:text-3xl">¡Tu alojamiento ya está visible para miles de estudiantes universitarios!</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">Tu habitación en Yanahuara ha sido publicada con éxito y ya aparece en las búsquedas activas de alumnos de la {university} y universidades cercanas.</p>

              <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-border bg-secondary p-4 text-left sm:flex-row sm:items-center">
                <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl sm:w-32">
                  <img src="/habitat-room.png" alt="Habitación publicada" className="h-full w-full object-cover" />
                  <span className="absolute left-2 top-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Activo</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-1 font-bold">{propertyType} cerca de la {university}</h3>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">Yanahuara, Arequipa · A 1.2 km del campus</p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                    <p className="text-xl font-bold">S/ {price} <span className="text-xs font-normal text-muted-foreground">/ mes</span></p>
                    <Link href="/alojamiento/1" className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700"><Eye size={15} />Ver anuncio en vivo</Link>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-border bg-card p-4 text-left">
                <h3 className="flex items-center gap-2 font-bold"><Share2 size={18} className="text-yellow-700" />Comparte tu publicación para alquilarlo más rápido</h3>
                <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-secondary p-2">
                  <span className="truncate text-sm font-bold">habitat.pe/alojamiento/yanahuara-ucsm-650</span>
                  <button type="button" onClick={() => navigator.clipboard?.writeText(shareUrl)} className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-lg bg-card px-3 text-xs font-bold shadow-sm"><Copy size={14} />Copiar</button>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Acabo de publicar mi alojamiento en Habitat: ${shareUrl}`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-bold text-white"><MessageCircle size={17} />Compartir por WhatsApp</a>
                  <button type="button" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-secondary px-4 text-sm font-bold"><Share2 size={17} />Compartir en grupos UCSM</button>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-secondary p-4 text-left">
                <h3 className="font-bold">Próximos pasos sugeridos</h3>
                <div className="mt-3 grid gap-3 text-sm">
                  <p className="flex gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold">1</span><span><strong>Atiende solicitudes de visita.</strong> Te notificaremos cuando un estudiante quiera coordinar.</span></p>
                  <p className="flex gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">2</span><span><strong>Agenda verificación gratuita.</strong> La insignia verificada aumenta la confianza de estudiantes.</span></p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link href="/propietario" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold">Ir a mi panel</Link>
                <Link href="/alojamiento/1" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-secondary px-5 text-sm font-bold"><Eye size={17} />Ver ficha pública</Link>
              </div>
            </div>
          </section>
        </div>
      )}

      <Footer />
    </div>
  )
}
