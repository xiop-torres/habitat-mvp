'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { use, useEffect, useState, useRef } from 'react'
import {
  Archive,
  ArrowLeft,
  Check,
  CheckCircle2,
  Cloud,
  Eye,
  ImagePlus,
  Info,
  Loader2,
  MapPin,
  PauseCircle,
  Save,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  TriangleAlert,
  Upload,
  Wifi,
  X,
  Zap,
} from 'lucide-react'
import { LocationPicker } from '@/components/LocationPicker'
import { AppHeader, Footer } from '@/components/Shared'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Listing } from '@/lib/supabase/listings'
import { STORAGE_BUCKETS, STORAGE_LIMITS, getListingStoragePath, getListingImageUrl } from '@/lib/supabase/storage'
import { UNIVERSITIES, resolveUniversity } from '@/lib/universities'
import { generateDistanceLabel } from '@/lib/location'

const allAmenities = ['WiFi', 'Baño privado', 'Escritorio amplio', 'Agua caliente', 'Cocina equipada', 'Lavandería', 'Bicicletero', 'Acepta mascotas', 'Amoblado']
const photos = [
  { src: '/habitat-room.png', label: 'Dormitorio principal' },
  { src: '/habitat-hero.png', label: 'Zona de estudio' },
  { src: '/placeholder.jpg', label: 'Baño privado' },
  { src: '/habitat-room.png', label: 'Cocina equipada' },
  { src: '/habitat-hero.png', label: 'Clóset empotrado' },
]

export default function EditListing({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  // State
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [saved, setSaved] = useState(false)
  const [toast, setToast] = useState('')

  // Form Fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [propertyType, setPropertyType] = useState('Habitación individual')
  const [district, setDistrict] = useState('')
  const [addressRef, setAddressRef] = useState('')
  const [university, setUniversity] = useState<string>('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [price, setPrice] = useState('')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [availableFrom, setAvailableFrom] = useState('')

  // Image state
  const [existingPhotos, setExistingPhotos] = useState<{ id: string, storage_path: string, preview: string, is_cover: boolean, sort_order: number }[]>([])
  const [newPhotos, setNewPhotos] = useState<{ file: File; preview: string }[]>([])
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cargar listing real y validar permisos
  useEffect(() => {
    async function loadListing() {
      const supabase = createSupabaseBrowserClient()
      
      // 1. Validar sesión
      const { data: authData } = await supabase.auth.getUser()
      if (!authData.user) {
        router.replace('/login')
        return
      }

      // Validar rol en profile
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', authData.user.id).single()
      if (profile?.role === 'student') {
        router.replace('/buscar')
        return
      }

      // 2. Obtener listing (RLS permite select a dueños)
      const { data, error } = await supabase
        .from('listings')
        .select('*, listing_images(*)')
        .eq('id', id)
        .maybeSingle()

      if (error || !data) {
        // No existe o no es de este owner
        setErrorMsg('El alojamiento no existe o no tienes permiso para editarlo.')
        setLoading(false)
        return
      }

      if (data.owner_id !== authData.user.id) {
        setErrorMsg('No tienes permiso para editar este alojamiento.')
        setLoading(false)
        return
      }

      // 3. Inicializar form con datos reales
      setListing(data)
      setTitle(data.title || '')
      setDescription(data.description || '')
      setPropertyType(data.property_type || 'Habitación individual')
      setDistrict(data.district || '')
      setAddressRef(data.address_reference || '')
      
      const resolvedUni = resolveUniversity(data.university_nearby)
      if (resolvedUni) {
        setUniversity(resolvedUni.storedValue)
      } else {
        setUniversity(data.university_nearby || '')
      }

      setLat(data.lat)
      setLng(data.lng)
      setPrice(data.price_monthly?.toString() || '')
      setSelectedAmenities(data.amenities || [])
      setAvailableFrom(data.available_from || '')

      if (data.listing_images) {
        const sortedImages = data.listing_images.sort((a: any, b: any) => a.sort_order - b.sort_order)
        setExistingPhotos(
          sortedImages.map((img: any) => ({
            id: img.id,
            storage_path: img.storage_path,
            preview: getListingImageUrl(img.storage_path),
            is_cover: img.is_cover,
            sort_order: img.sort_order,
          }))
        )
      }

      setLoading(false)
    }
    loadListing()
  }, [id, router])

  useEffect(() => {
    return () => newPhotos.forEach(p => URL.revokeObjectURL(p.preview))
  }, [newPhotos])

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const totalCurrent = existingPhotos.filter(p => !deletedPhotoIds.includes(p.id)).length + newPhotos.length
    if (totalCurrent + files.length > STORAGE_LIMITS.MAX_FILES_PER_LISTING) {
      setToast(`Solo puedes tener hasta ${STORAGE_LIMITS.MAX_FILES_PER_LISTING} fotos totales.`)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    const validFiles: { file: File; preview: string }[] = []
    for (const file of files) {
      if (!STORAGE_LIMITS.ALLOWED_MIME_TYPES.includes(file.type as any)) {
        setToast(`El archivo "${file.name}" no es válido.`)
        continue
      }
      if (file.size > STORAGE_LIMITS.MAX_FILE_SIZE_BYTES) {
        setToast(`El archivo "${file.name}" supera el límite de ${STORAGE_LIMITS.MAX_FILE_SIZE_MB}MB.`)
        continue
      }
      validFiles.push({ file, preview: URL.createObjectURL(file) })
    }

    setNewPhotos(prev => [...prev, ...validFiles])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeExistingPhoto(id: string) {
    if (!confirm('¿Seguro que deseas eliminar esta foto? Los cambios se aplicarán al guardar.')) return
    setDeletedPhotoIds(prev => [...prev, id])
  }

  function removeNewPhoto(index: number) {
    setNewPhotos(prev => {
      const copy = [...prev]
      URL.revokeObjectURL(copy[index].preview)
      copy.splice(index, 1)
      return copy
    })
  }

  function toggleAmenity(amenity: string) {
    setSelectedAmenities(current =>
      current.includes(amenity) ? current.filter(item => item !== amenity) : [...current, amenity]
    )
  }

  async function saveChanges(event: React.FormEvent) {
    event.preventDefault()
    if (saving || !listing) return

    const totalPhotos = existingPhotos.filter(p => !deletedPhotoIds.includes(p.id)).length + newPhotos.length
    if (totalPhotos === 0) {
      setToast('Debes mantener al menos 1 fotografía.')
      return
    }

    setSaving(true)
    setErrorMsg('')

    const supabase = createSupabaseBrowserClient()
    const distanceLabel = generateDistanceLabel(lat, lng, university)

    const updates = {
      title,
      description,
      property_type: propertyType,
      district,
      address_reference: addressRef,
      lat,
      lng,
      university_nearby: university || null,
      distance_label: distanceLabel,
      price_monthly: Number(price) || 0,
      amenities: selectedAmenities,
      available_from: availableFrom || null,
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', listing.id)

    if (error) {
      setSaving(false)
      setToast('Hubo un error al guardar. Intenta de nuevo.')
      return
    }

    let imageError = false
    
    // Deletions
    if (deletedPhotoIds.length > 0) {
      const photosToDelete = existingPhotos.filter(p => deletedPhotoIds.includes(p.id))
      for (const p of photosToDelete) {
        const { error: storageError } = await supabase.storage.from(STORAGE_BUCKETS.LISTINGS).remove([p.storage_path])
        if (storageError) {
          console.error('Storage deletion error:', storageError)
          imageError = true
        } else {
          const { error: dbError } = await supabase.from('listing_images').delete().eq('id', p.id)
          if (dbError) {
            console.error('DB image deletion error:', dbError)
            imageError = true
          }
        }
      }
    }

    // Uploads
    if (newPhotos.length > 0) {
      for (const photo of newPhotos) {
        const path = getListingStoragePath(listing.owner_id, listing.id, photo.file.name)
        const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKETS.LISTINGS).upload(path, photo.file, {
          cacheControl: '3600',
          upsert: false
        })
        
        if (uploadError) {
          console.error('Storage upload error:', uploadError)
          imageError = true
        } else {
          const { error: dbError } = await supabase.from('listing_images').insert({
            listing_id: listing.id,
            storage_path: path,
            sort_order: 999, // Se corrige en el reordenamiento a continuación
            is_cover: false
          })
          if (dbError) {
             console.error('DB image insert error:', dbError)
             imageError = true
          }
        }
      }
    }

    // Reordenamiento y Cover (sort_order y is_cover)
    if (deletedPhotoIds.length > 0 || newPhotos.length > 0) {
      const { data: currentImages } = await supabase.from('listing_images').select('*').eq('listing_id', listing.id).order('sort_order')
      if (currentImages && currentImages.length > 0) {
        let hasCover = false
        for (let i = 0; i < currentImages.length; i++) {
          const img = currentImages[i]
          const shouldBeCover = !hasCover && (img.is_cover || i === 0)
          if (shouldBeCover) hasCover = true
          
          if (img.sort_order !== i || img.is_cover !== shouldBeCover) {
            await supabase.from('listing_images').update({ sort_order: i, is_cover: shouldBeCover }).eq('id', img.id)
          }
        }
      }
    }

    setSaving(false)

    if (imageError) {
      setToast('Alojamiento guardado, pero hubo un error con algunas imágenes.')
      setTimeout(() => setSaved(true), 1500)
    } else {
      setToast('¡Alojamiento actualizado!')
      setTimeout(() => setSaved(true), 700)
    }
  }

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF8FC]">
        <AppHeader owner />
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="animate-spin text-[#EAB308]" size={36} />
        </div>
        <Footer />
      </div>
    )
  }

  // --- Error State (UUID invalido o no es dueño) ---
  if (errorMsg || !listing) {
    return (
      <div className="min-h-screen bg-[#FBF8FC] text-[#1B1B1E]">
        <AppHeader owner />
        <main className="mx-auto flex max-w-7xl justify-center px-4 py-16 sm:px-6 lg:px-8">
          <section className="w-full max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <TriangleAlert className="mx-auto text-red-500" size={48} />
            <h1 className="mt-4 text-2xl font-black text-red-700">Acceso denegado</h1>
            <p className="mt-2 text-sm text-[#554336]">{errorMsg}</p>
            <div className="mt-6">
              <Link href="/propietario" className="inline-flex items-center justify-center rounded-xl bg-[#1B1B1E] px-6 py-3 text-sm font-black text-white">
                Volver al panel
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    )
  }

  // --- Saved State ---
  if (saved) {
    return (
      <div className="min-h-screen bg-[#FBF8FC]">
        <AppHeader owner />
        <main className="mx-auto flex max-w-7xl justify-center px-4 py-16 sm:px-6 lg:px-8">
          <section className="w-full max-w-xl rounded-3xl border border-[#E4E1E6] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto grid size-20 place-items-center rounded-full bg-[#FACC15]">
              <CheckCircle2 size={40} />
            </div>
            <p className="mt-6 text-xs font-black uppercase tracking-[0.15em] text-[#8D4B00]">Cambios guardados</p>
            <h1 className="mt-3 text-3xl font-black">Tu alojamiento está actualizado</h1>
            <p className="mt-3 text-sm leading-7 text-[#554336]">
              Los cambios ya se reflejan en la ficha pública.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href={`/alojamiento/${listing.id}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#FACC15] px-5 text-sm font-black">
                <Eye size={17} /> Ver ficha pública
              </Link>
              <Link href="/propietario" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#D4D4D8] px-5 text-sm font-bold">
                Volver al panel
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-[#FBF8FC] text-[#1B1B1E]">
      <AppHeader owner />
      <main className="pt-5">
        <section className="border-b border-[#E4E1E6] bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#554336]">
              <Link href="/propietario" className="hover:text-[#8D4B00]">Panel de Propietario</Link>
              <span>›</span>
              <span>Mis Alojamientos</span>
              <span>›</span>
              <strong className="max-w-[280px] truncate text-[#1B1B1E]">{listing.title}</strong>
            </div>
            <div className="mt-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight">Editar Alojamiento</h1>
                {listing.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#D9FBE0] px-2.5 py-1 text-[11px] font-black text-[#006E2D]">
                    <ShieldCheck size={14} /> Verificado Habitat
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/alojamiento/${listing.id}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#F0EDF1] px-4 py-2.5 text-xs font-black">
                  <Eye size={16} /> Ver ficha pública
                </Link>
                <button
                  type="submit"
                  form="edit-listing"
                  disabled={saving}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#FACC15] px-5 py-2.5 text-xs font-black shadow-sm disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#F6F2F7] p-3 text-xs leading-5 text-[#554336]">
              <Info size={16} className="mt-0.5 shrink-0 text-[#8D4B00]" /> Los cambios se reflejarán en las búsquedas de estudiantes inmediatamente tras guardar.
            </div>
          </div>
        </section>

        <form id="edit-listing" onSubmit={saveChanges} className="mx-auto grid max-w-7xl items-start gap-6 px-4 py-6 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-8">
          <div className="space-y-6 lg:col-span-8">
            <nav className="sticky top-16 z-20 flex gap-1 overflow-x-auto rounded-xl bg-[#FBF8FC]/95 p-1.5 shadow-sm backdrop-blur">
              <a href="#basicos" className="whitespace-nowrap rounded-lg bg-white px-3 py-2 text-xs font-black text-[#8D4B00] shadow-sm">1. Básica y precio</a>
              <a href="#fotos" className="whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold text-[#554336] hover:bg-white">2. Fotos</a>
              <a href="#servicios" className="whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold text-[#554336] hover:bg-white">3. Servicios</a>
              <a href="#ubicacion" className="whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold text-[#554336] hover:bg-white">4. Ubicación</a>
            </nav>

            {/* Básica y Precio */}
            <EditorSection id="basicos" icon={Sparkles} title="Información básica y precios" subtitle="Datos visibles en las tarjetas de búsqueda de Arequipa">
              <label className="grid gap-2 text-sm font-black">
                Título descriptivo para estudiantes
                <div className="relative">
                  <input className="field pr-12" maxLength={80} required value={title} onChange={event => setTitle(event.target.value)} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#887364]">{title.length}/80</span>
                </div>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-black">
                  Tipo de alojamiento
                  <select className="field" value={propertyType} onChange={e => setPropertyType(e.target.value)}>
                    <option>Habitación individual</option>
                    <option>Habitación compartida</option>
                    <option>Departamento</option>
                    <option>Casa / Residencia</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 rounded-2xl bg-[#F6F2F7] p-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-black">
                  Alquiler mensual (PEN / S/)
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-[#554336]">S/</span>
                    <input type="number" required min="100" className="field pl-10 text-xl font-black" value={price} onChange={event => setPrice(event.target.value)} />
                  </div>
                </label>
              </div>

              <label className="grid gap-2 text-sm font-black">
                Descripción detallada para el estudiante
                <textarea required className="field min-h-36 leading-6" value={description} onChange={event => setDescription(event.target.value)} />
                <span className="text-xs font-normal text-[#887364]">Describe iluminación, ambientes, conexión a internet y cercanía a facultades.</span>
              </label>
            </EditorSection>

            {/* Fotos */}
            <EditorSection id="fotos" icon={ImagePlus} title="Galería de fotos del alojamiento" subtitle={`Máximo ${STORAGE_LIMITS.MAX_FILES_PER_LISTING} imágenes totales. Agrega, elimina y guarda los cambios.`}>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {/* Existing Photos */}
                {existingPhotos.filter(p => !deletedPhotoIds.includes(p.id)).map((photo, index) => (
                  <div key={photo.id} className="group relative overflow-hidden rounded-xl bg-[#EAE7EB] aspect-[4/3]">
                    <img src={photo.preview} alt={`Foto ${index + 1}`} className="size-full object-cover transition duration-300" />
                    {photo.is_cover && (
                      <span className="absolute left-2 top-2 rounded bg-[#FACC15] px-2 py-1 text-[10px] font-bold text-black shadow-sm">Portada</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeExistingPhoto(photo.id)}
                      className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}

                {/* New Photos */}
                {newPhotos.map((photo, index) => (
                  <div key={photo.preview} className="group relative overflow-hidden rounded-xl bg-[#EAE7EB] aspect-[4/3]">
                    <img src={photo.preview} alt={`Nueva foto ${index + 1}`} className="size-full object-cover transition duration-300" />
                    <span className="absolute left-2 top-2 rounded bg-emerald-500 px-2 py-1 text-[10px] font-bold text-white shadow-sm">Nueva</span>
                    <button
                      type="button"
                      onClick={() => removeNewPhoto(index)}
                      className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}

                {/* Subir Nueva (si no supera el límite) */}
                {existingPhotos.filter(p => !deletedPhotoIds.includes(p.id)).length + newPhotos.length < STORAGE_LIMITS.MAX_FILES_PER_LISTING && (
                  <label className="grid cursor-pointer place-items-center rounded-xl border-2 border-dashed border-[#D4D4D8] bg-[#F6F2F7] text-sm font-bold transition-colors hover:bg-zinc-100 aspect-[4/3]">
                    <div className="flex flex-col items-center text-[#554336]">
                      <ImagePlus className="mb-2 text-[#8D4B00]" size={24} />
                      <span>Añadir foto</span>
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
              
              {existingPhotos.filter(p => !deletedPhotoIds.includes(p.id)).length + newPhotos.length === 0 && (
                <div className="mt-2 text-sm text-amber-700 font-bold bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <TriangleAlert size={16} className="inline mr-1" />
                  Al menos debes dejar 1 foto antes de guardar.
                </div>
              )}
            </EditorSection>

            {/* Servicios */}
            <EditorSection id="servicios" icon={CheckCircle2} title="Servicios y equipamiento" subtitle="Selecciona todo lo que encontrará listo para usar">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {allAmenities.map(amenity => {
                  const active = selectedAmenities.includes(amenity)
                  return (
                    <button
                      type="button"
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl p-3 text-center text-xs font-black transition ${active ? 'bg-[#FACC15] text-[#18181B] shadow-sm' : 'bg-[#F6F2F7] text-[#554336] hover:bg-[#EAE7EB]'}`}
                    >
                      <Wifi size={22} />
                      <span>{amenity}</span>
                      {active ? <Check size={16} /> : <PlusIcon />}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs font-bold text-[#8D4B00]">{selectedAmenities.length} seleccionados</p>
            </EditorSection>

            {/* Ubicación */}
            <EditorSection id="ubicacion" icon={MapPin} title="Ubicación" subtitle="La dirección exacta se comparte cuando se confirma una visita">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-4">
                  <label className="grid gap-2 text-sm font-black">
                    Distrito
                    <input required className="field" value={district} onChange={e => setDistrict(e.target.value)} />
                  </label>
                  <label className="grid gap-2 text-sm font-black">
                    Dirección de referencia
                    <input className="field" value={addressRef} onChange={e => setAddressRef(e.target.value)} />
                  </label>
                  <label className="grid gap-2 text-sm font-black mt-2">
                    ¿Qué campus queda más cerca?
                    <div className="grid gap-2 mt-2">
                      {UNIVERSITIES.map(uni => (
                        <button
                          type="button"
                          key={uni.id}
                          onClick={() => setUniversity(uni.storedValue)}
                          className={`flex items-center justify-between rounded-xl border p-4 text-left text-sm font-bold ${
                            university === uni.storedValue ? 'border-[#FACC15] bg-[#FACC15]/10 text-[#18181B]' : 'border-[#E4E1E6] bg-white text-[#554336]'
                          }`}
                        >
                          <span>{uni.fullName} ({uni.shortName})</span>
                          {university === uni.storedValue && <Check size={17} />}
                        </button>
                      ))}
                    </div>
                  </label>
                </div>
                <div className="mt-6 md:mt-0">
                  <LocationPicker lat={lat} lng={lng} onChange={(newLat, newLng) => { setLat(newLat); setLng(newLng) }} />
                </div>
              </div>
            </EditorSection>

            <div className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <span className="inline-flex items-center gap-2 text-xs text-[#554336]">
                <Cloud size={17} className="text-[#006E2D]" /> Cambios guardados manualmente
              </span>
              <div className="flex gap-2">
                <Link href="/propietario" className="rounded-xl bg-[#F0EDF1] px-4 py-3 text-xs font-black hover:bg-[#EAE7EB]">
                  Cancelar
                </Link>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#FACC15] px-5 py-3 text-xs font-black shadow-sm disabled:opacity-50">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Guardar cambios
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:col-span-4">
            <section className="overflow-hidden rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#554336]">Vista previa de tu anuncio</p>
                <span className="rounded-full bg-[#D9FBE0] px-2 py-1 text-[10px] font-black text-[#006E2D]">{listing.status}</span>
              </div>
              <div className="mt-4 overflow-hidden rounded-xl bg-[#F6F2F7]">
                <div className="relative h-48 bg-[#E4E4E7]">
                  <img src="/habitat-room.png" alt={title} className="size-full object-cover" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <strong className="text-2xl font-black">S/ {price || '0'}</strong>
                  </div>
                  <h2 className="mt-2 text-base font-black leading-5">{title || 'Título de alojamiento'}</h2>
                  <p className="mt-2 flex gap-1 text-xs text-[#554336]">
                    <MapPin size={14} className="text-[#8D4B00]" /> {district || 'Distrito'}
                  </p>
                </div>
              </div>
              <Link href={`/alojamiento/${listing.id}`} className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#F0EDF1] text-xs font-black hover:bg-[#EAE7EB]">
                <Eye size={15} /> Previsualizar como estudiante
              </Link>
            </section>
            
            <section className="rounded-2xl bg-[#F6F2F7] p-4">
              <p className="text-xs font-black text-[#554336]">Acciones avanzadas</p>
              <button type="button" onClick={() => setToast('Pausar estará disponible pronto.')} className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-bold text-[#8D4B00] hover:bg-[#EAE7EB]">
                <PauseCircle size={15} /> Pausar anuncio temporalmente
              </button>
              <button type="button" onClick={() => setToast('Archivar estará disponible pronto.')} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-bold text-[#BA1A1A] hover:bg-[#FCE7E7]">
                <Archive size={15} /> Archivar o retirar de Habitat
              </button>
            </section>
          </aside>
        </form>
      </main>
      <Footer />
      {toast && (
        <div role="status" className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#1B1B1E] px-5 py-3 text-sm font-bold text-white shadow-xl transition-all duration-300">
          {toast}
        </div>
      )}
    </div>
  )
}

function EditorSection({ id, icon: Icon, title, subtitle, children }: { id: string; icon: typeof Sparkles; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-32 space-y-6 rounded-2xl bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-[#FACC15] text-[#18181B]">
            <Icon size={21} />
          </div>
          <div>
            <h2 className="font-black">{title}</h2>
            <p className="text-xs text-[#887364]">{subtitle}</p>
          </div>
        </div>
        {id === 'basicos' && <span className="hidden rounded-full bg-[#F0EDF1] px-3 py-1 text-[10px] font-black sm:inline-flex">Paso clave</span>}
      </div>
      {children}
    </section>
  )
}

function PlusIcon() {
  return <span className="text-lg leading-none text-[#887364]">+</span>
}
