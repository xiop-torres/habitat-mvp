'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Home,
  ImagePlus,
  Loader2,
  MapPin,
  MessageCircle,
  ShieldCheck,
  X,
} from 'lucide-react'
import { AppHeader, Footer } from '@/components/Shared'
import { cn } from '@/lib/utils'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { CreateListingInput } from '@/lib/supabase/listings'
import { STORAGE_BUCKETS, STORAGE_LIMITS, getListingStoragePath } from '@/lib/supabase/storage'

const steps = ['Tipo', 'Detalles', 'Ubicación', 'Universidad', 'Precio', 'Servicios', 'Fotos', 'Plazos', 'Reglas', 'Vista previa']
const stepTitles = [
  '¿Qué tipo de espacio publicarás?',
  'Describe tu alojamiento',
  '¿Dónde está ubicado?',
  '¿Qué campus queda más cerca?',
  'Define precio y condiciones',
  'Selecciona los servicios incluidos',
  'Agrega fotos del alojamiento',
  'Define disponibilidad y estancia',
  'Establece reglas de convivencia',
  'Revisa antes de publicar',
]

const RULE_OPTIONS = [
  'Prohibido fumar',
  'No se permiten mascotas',
  'Visitas con aviso previo',
  'Horario de silencio 10:30 PM - 7:00 AM',
]

const SERVICE_OPTIONS = [
  'WiFi 200 Mbps',
  'Baño privado',
  'Escritorio de estudio',
  'Agua caliente 24/7',
  'Cocina equipada',
  'Lavandería / tendal',
  'Bicicleta',
  'Acepta mascotas',
]

export default function NewPropertyPage() {
  const router = useRouter()
  const submittingRef = useRef(false)

  // Auth guard
  const [authChecked, setAuthChecked] = useState(false)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.role !== 'owner') {
        router.replace('/buscar')
        return
      }
      setIsOwner(true)
      setAuthChecked(true)
    }
    checkAuth()
  }, [router])

  // Form state
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')

  // Step 0 — Tipo
  const [propertyType, setPropertyType] = useState('Habitación individual amoblada')

  // Step 1 — Detalles (nuevo)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  // Step 2 — Ubicación
  const [district, setDistrict] = useState('')
  const [addressReference, setAddressReference] = useState('')

  // Step 3 — Universidad
  const [university, setUniversity] = useState('UCSM')

  // Step 4 — Precio
  const [price, setPrice] = useState('')

  // Step 5 — Servicios (amenities)
  const [services, setServices] = useState<string[]>([])

  // Step 6 — Fotos
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    if (photos.length + files.length > STORAGE_LIMITS.MAX_FILES_PER_LISTING) {
      setFormError(`Solo puedes subir hasta ${STORAGE_LIMITS.MAX_FILES_PER_LISTING} fotos.`)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    const newPhotos: { file: File; preview: string }[] = []
    for (const file of files) {
      if (!STORAGE_LIMITS.ALLOWED_MIME_TYPES.includes(file.type as any)) {
        setFormError(`El archivo "${file.name}" no es válido. Solo se admiten JPEG, PNG y WEBP.`)
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }
      if (file.size > STORAGE_LIMITS.MAX_FILE_SIZE_BYTES) {
        setFormError(`El archivo "${file.name}" supera el límite de ${STORAGE_LIMITS.MAX_FILE_SIZE_MB}MB.`)
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }
      newPhotos.push({
        file,
        preview: URL.createObjectURL(file)
      })
    }

    setPhotos(prev => [...prev, ...newPhotos])
    setFormError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removePhoto(index: number) {
    setPhotos(prev => {
      const newPhotos = [...prev]
      URL.revokeObjectURL(newPhotos[index].preview)
      newPhotos.splice(index, 1)
      return newPhotos
    })
  }

  useEffect(() => {
    // Cleanup object URLs on unmount
    return () => {
      photos.forEach(p => URL.revokeObjectURL(p.preview))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Step 7 — Plazos
  const [availableFrom, setAvailableFrom] = useState('')

  // Step 8 — Reglas
  const [rules, setRules] = useState<string[]>([RULE_OPTIONS[0], RULE_OPTIONS[1], RULE_OPTIONS[3]])

  function toggleService(service: string) {
    setServices(current =>
      current.includes(service) ? current.filter(item => item !== service) : [...current, service]
    )
  }

  function toggleRule(rule: string) {
    setRules(current =>
      current.includes(rule) ? current.filter(item => item !== rule) : [...current, rule]
    )
  }

  // Validation per step
  function validateCurrentStep(): string {
    if (step === 1) {
      if (!title.trim()) return 'El título es obligatorio.'
      if (title.trim().length < 10) return 'El título debe tener al menos 10 caracteres.'
      if (!description.trim()) return 'La descripción es obligatoria.'
    }
    if (step === 2) {
      if (!district.trim()) return 'El distrito es obligatorio.'
      if (!addressReference.trim()) return 'La referencia de dirección es obligatoria.'
    }
    if (step === 4) {
      const p = Number(price)
      if (!price || isNaN(p) || p <= 0) return 'El precio mensual debe ser mayor a 0.'
    }
    if (step === 6) {
      if (photos.length === 0) return 'Sube al menos 1 fotografía.'
    }
    return ''
  }

  function handleNext() {
    const error = validateCurrentStep()
    if (error) {
      setFormError(error)
      return
    }
    setFormError('')
    setStep(current => Math.min(steps.length - 1, current + 1))
  }

  async function handlePublish() {
    if (submittingRef.current) return
    submittingRef.current = true
    setLoading(true)
    setFormError('')

    try {
      const supabase = createSupabaseBrowserClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }

      // Build payload — owner_id is set server-side by RLS, but browser client
      // requires it in the INSERT. We use the authenticated user id only.
      const input: CreateListingInput & { owner_id: string } = {
        owner_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        property_type: propertyType,
        district: district.trim(),
        address_reference: addressReference.trim() || null,
        lat: null,
        lng: null,
        university_nearby: university,
        distance_label: null,
        price_monthly: Number(price),
        currency: 'PEN',
        amenities: services,
        rules,
        available_from: availableFrom || null,
      }

      const { data: listingData, error: listingError } = await supabase
        .from('listings')
        .insert({ ...input, status: 'published' })
        .select('id')
        .single()

      if (listingError) {
        setFormError(listingError.message || 'No se pudo publicar el alojamiento. Intenta de nuevo.')
        return
      }

      let imageUploadError = false

      if (photos.length > 0) {
        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i]
          const path = getListingStoragePath(user.id, listingData.id, photo.file.name)

          const { error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKETS.LISTINGS)
            .upload(path, photo.file, {
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) {
            console.error('[Storage Upload Error]:', uploadError)
            imageUploadError = true
            continue
          }

          const { error: dbError } = await supabase
            .from('listing_images')
            .insert({
              listing_id: listingData.id,
              storage_path: path,
              sort_order: i,
              is_cover: i === 0,
            })

          if (dbError) {
            console.error('[Listing Image DB Error]:', dbError)
            imageUploadError = true
          }
        }
      }

      if (imageUploadError) {
        alert('El alojamiento fue publicado, pero ocurrió un problema subiendo algunas fotos. Podrás gestionarlas más adelante desde tu panel.')
      }

      router.push(`/propietario/publicado?id=${listingData.id}`)
    } catch {
      setFormError('Ocurrió un error inesperado. Intenta de nuevo.')
    } finally {
      setLoading(false)
      submittingRef.current = false
    }
  }

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    )
  }

  if (!isOwner) return null

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
          <div className="flex min-w-[800px] gap-2">
            {steps.map((item, index) => (
              <button
                type="button"
                key={item}
                onClick={() => index < step && setStep(index)}
                className={cn(
                  'flex min-w-[72px] flex-1 items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold',
                  index === step
                    ? 'bg-primary text-foreground'
                    : index < step
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-card text-zinc-400 ring-1 ring-border',
                )}
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/80 text-[10px]">
                  {index < step ? <Check size={13} /> : index + 1}
                </span>
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_340px]">
          <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-yellow-700">
              Paso {step + 1} de {steps.length}
            </p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{stepTitles[step]}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Completa la información para que los estudiantes entiendan tu espacio con claridad.
            </p>

            <div className="mt-8">
              {/* PASO 0 — Tipo */}
              {step === 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {['Habitación individual amoblada', 'Habitación compartida', 'Mini departamento', 'Casa / residencia'].map(type => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setPropertyType(type)}
                      className={cn(
                        'rounded-2xl border p-5 text-left',
                        propertyType === type ? 'border-primary bg-primary/20' : 'border-border bg-secondary',
                      )}
                    >
                      <Home className="text-yellow-700" size={21} />
                      <p className="mt-4 font-bold">{type}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Ideal para estudiantes universitarios</p>
                    </button>
                  ))}
                </div>
              )}

              {/* PASO 1 — Detalles (título + descripción) */}
              {step === 1 && (
                <div className="grid gap-5">
                  <label className="grid gap-2 text-sm font-bold">
                    Título del alojamiento *
                    <input
                      className="field"
                      placeholder="Ej: Habitación amoblada con baño privado cerca de la UCSM"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      maxLength={120}
                    />
                    <span className="text-xs font-normal text-muted-foreground">{title.length}/120 caracteres</span>
                  </label>
                  <label className="grid gap-2 text-sm font-bold">
                    Descripción *
                    <textarea
                      className="field min-h-[120px] resize-y"
                      placeholder="Describe el espacio, la zona, qué incluye y por qué es ideal para universitarios..."
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      maxLength={1000}
                    />
                    <span className="text-xs font-normal text-muted-foreground">{description.length}/1000 caracteres</span>
                  </label>
                </div>
              )}

              {/* PASO 2 — Ubicación */}
              {step === 2 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-bold">
                    Distrito *
                    <input
                      className="field"
                      placeholder="Ej: Yanahuara"
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-bold">
                    Referencia de dirección *
                    <input
                      className="field"
                      placeholder="Ej: Calle Cortaderas 214, a 2 cuadras del parque"
                      value={addressReference}
                      onChange={e => setAddressReference(e.target.value)}
                    />
                  </label>
                  <div className="flex items-start gap-3 rounded-xl bg-secondary p-4 text-sm text-muted-foreground sm:col-span-2">
                    <MapPin className="shrink-0 text-yellow-700" size={19} />
                    La dirección exacta solo se mostrará después de confirmar una visita.
                  </div>
                </div>
              )}

              {/* PASO 3 — Universidad */}
              {step === 3 && (
                <div className="grid gap-3">
                  {['UCSM', 'UNSA', 'Universidad Católica San Pablo', 'UTP'].map(item => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setUniversity(item)}
                      className={cn(
                        'flex items-center justify-between rounded-xl border p-4 text-left text-sm font-bold',
                        university === item ? 'border-primary bg-primary/20' : 'border-border bg-secondary',
                      )}
                    >
                      <span>{item}</span>
                      {university === item && <Check size={17} />}
                    </button>
                  ))}
                </div>
              )}

              {/* PASO 4 — Precio */}
              {step === 4 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-bold">
                    Precio mensual (S/) *
                    <input
                      className="field text-2xl font-bold"
                      type="number"
                      min={1}
                      placeholder="650"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                    />
                  </label>
                  <div className="sm:col-span-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
                    <ShieldCheck className="mr-2 inline" size={17} />
                    Precio competitivo para alojamientos cerca de tu campus.
                  </div>
                </div>
              )}

              {/* PASO 5 — Servicios */}
              {step === 5 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {SERVICE_OPTIONS.map(service => (
                    <button
                      type="button"
                      key={service}
                      onClick={() => toggleService(service)}
                      className={cn(
                        'flex items-center justify-between rounded-xl border p-4 text-left text-sm font-bold',
                        services.includes(service) ? 'border-primary bg-primary/20' : 'border-border bg-card',
                      )}
                    >
                      <span>{service}</span>
                      {services.includes(service) ? (
                        <Check size={17} className="text-yellow-700" />
                      ) : (
                        <span className="text-zinc-400">+</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* PASO 6 — Fotos (Subida real a Storage) */}
              {step === 6 && (
                <div className="grid gap-4">
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                    Sube hasta {STORAGE_LIMITS.MAX_FILES_PER_LISTING} fotos de tu alojamiento (máx {STORAGE_LIMITS.MAX_FILE_SIZE_MB}MB c/u). La primera imagen será la portada.
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {photos.map((photo, index) => (
                      <div key={photo.preview} className="group relative overflow-hidden rounded-2xl">
                        <img src={photo.preview} alt={`Foto ${index + 1}`} className="h-48 w-full object-cover" />
                        {index === 0 && (
                          <span className="absolute left-2 top-2 rounded bg-primary px-2 py-1 text-[10px] font-bold">Portada</span>
                        )}
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    
                    {photos.length < STORAGE_LIMITS.MAX_FILES_PER_LISTING && (
                      <label className="grid min-h-48 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-zinc-300 bg-secondary text-sm font-bold transition-colors hover:bg-zinc-100">
                        <div className="text-center flex flex-col items-center">
                          <ImagePlus className="mb-2 text-yellow-700" />
                          <span>Subir foto</span>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept={STORAGE_LIMITS.ALLOWED_MIME_TYPES.join(',')}
                          multiple
                          onChange={handlePhotoSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* PASO 7 — Plazos */}
              {step === 7 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-bold">
                    Disponible desde
                    <input
                      className="field"
                      type="date"
                      value={availableFrom}
                      onChange={e => setAvailableFrom(e.target.value)}
                    />
                  </label>
                  <div className="rounded-xl bg-secondary p-4 text-sm text-muted-foreground sm:col-span-2">
                    Puedes actualizar disponibilidad y fechas desde tu panel después de publicar.
                  </div>
                </div>
              )}

              {/* PASO 8 — Reglas */}
              {step === 8 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {RULE_OPTIONS.map(rule => (
                    <label key={rule} className="flex items-center gap-3 rounded-xl border border-border bg-secondary p-4 text-sm font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rules.includes(rule)}
                        onChange={() => toggleRule(rule)}
                        className="size-4"
                      />
                      {rule}
                    </label>
                  ))}
                </div>
              )}

              {/* PASO 9 — Vista previa */}
              {step === 9 && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-secondary p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-yellow-700">Vista previa</p>
                    <h2 className="mt-3 text-2xl font-bold">{title || propertyType}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {district || 'Distrito'}, Arequipa
                      {university && ` · Cerca de ${university}`}
                    </p>
                    <p className="mt-4 text-3xl font-bold">
                      S/ {price || '–'} <span className="text-xs font-normal text-muted-foreground">/ mes</span>
                    </p>
                    {services.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {services.map(item => (
                          <span key={item} className="rounded-full bg-card px-3 py-1 text-xs font-bold">{item}</span>
                        ))}
                      </div>
                    )}
                    {description && (
                      <p className="mt-4 text-sm leading-6 text-muted-foreground line-clamp-3">{description}</p>
                    )}
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                    <Check className="mr-2 inline" size={16} />
                    Todo listo. Al publicar, tu alojamiento quedará visible para estudiantes.
                  </div>
                </div>
              )}
            </div>

            {/* Error message */}
            {formError && (
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <X size={16} className="shrink-0" />
                {formError}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() => { setFormError(''); setStep(current => Math.max(0, current - 1)) }}
                disabled={step === 0}
                className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-bold disabled:opacity-40"
              >
                Paso anterior
              </button>
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold"
                >
                  Continuar al paso {step + 2} <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold disabled:opacity-70"
                >
                  {loading ? (
                    <><Loader2 size={17} className="animate-spin" /> Publicando...</>
                  ) : (
                    <><CheckCircle2 size={17} /> Publicar alojamiento</>
                  )}
                </button>
              )}
            </div>
          </section>

          {/* Live preview sidebar */}
          <aside className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <img src={photos[0]?.preview || '/habitat-room.png'} alt="Vista previa del alojamiento" className="h-56 w-full object-cover" />
              <div className="p-5">
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                  Vista previa en tiempo real
                </span>
                <h2 className="mt-4 font-bold">{title || propertyType}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {university} {district && `· ${district}`}
                </p>
                <p className="mt-4 text-2xl font-bold">
                  {price ? `S/ ${price}` : '–'}
                  <span className="text-xs font-normal text-muted-foreground"> / mes</span>
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-bold">Consejo Habitat</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Las publicaciones con fotos claras, precio visible y distancia al campus reciben más solicitudes.
              </p>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  )
}
