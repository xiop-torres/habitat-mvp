'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Cargar el mapa de forma asncrona, deshabilitando SSR para Leaflet
const LocationMap = dynamic(() => import('./LocationMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/50 text-muted-foreground">
      <Loader2 size={32} className="animate-spin text-primary" />
      <p className="mt-4 font-semibold">Cargando mapa...</p>
    </div>
  ),
})

export type LocationPickerProps = {
  lat: number | null
  lng: number | null
  onChange: (lat: number | null, lng: number | null) => void
}

export function LocationPicker(props: LocationPickerProps) {
  return <LocationMap {...props} />
}
