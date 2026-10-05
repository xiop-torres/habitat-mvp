'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Cargar el mapa de forma asíncrona, deshabilitando SSR para Leaflet
const PublicLocationMapInner = dynamic(() => import('./PublicLocationMapInner'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/50 text-muted-foreground">
      <Loader2 size={32} className="animate-spin text-primary" />
      <p className="mt-4 font-semibold">Cargando mapa de la zona...</p>
    </div>
  ),
})

export type PublicLocationMapProps = {
  lat: number
  lng: number
  className?: string
}

export function PublicLocationMap(props: PublicLocationMapProps) {
  return <PublicLocationMapInner {...props} />
}
