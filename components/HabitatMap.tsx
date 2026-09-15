'use client'

import Link from 'next/link'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect } from 'react'

export type MapHome = {
  id: number | string
  title: string
  district: string
  price: number
  lat: number
  lng: number
}

function priceIcon(price: number) {
  return L.divIcon({
    className: 'habitat-price-marker',
    html: `<span>S/ ${price}</span>`,
    iconSize: [76, 36],
    iconAnchor: [38, 36],
    popupAnchor: [0, -34],
  })
}

function FitMarkers({ homes }: { homes: MapHome[] }) {
  const map = useMap()
  useEffect(() => {
    if (homes.length > 1) {
      map.fitBounds(L.latLngBounds(homes.map(home => [home.lat, home.lng])), { padding: [32, 32], maxZoom: 14 })
    }
  }, [homes, map])
  return null
}

export default function HabitatMap({ homes, className = 'h-[440px]' }: { homes: MapHome[]; className?: string }) {
  return <div className={`relative ${className} overflow-hidden rounded-3xl border border-border bg-[#e8eee2] shadow-sm`}>
    <MapContainer center={[-16.3989, -71.535]} zoom={13} scrollWheelZoom={false} className="habitat-map h-full w-full">
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitMarkers homes={homes} />
      {homes.map(home => <Marker key={home.id} position={[home.lat, home.lng]} icon={priceIcon(home.price)}><Popup><div className="min-w-44"><p className="font-bold text-foreground">S/ {home.price}<span className="text-xs font-normal text-gray-500"> / mes</span></p><p className="mt-1 text-sm font-semibold text-foreground">{home.title}</p><p className="mt-1 text-xs text-gray-500">{home.district}, Arequipa</p><Link href={`/alojamiento/${home.id}`} className="mt-3 inline-block text-xs font-bold text-foreground">Ver alojamiento</Link></div></Popup></Marker>)}
    </MapContainer>
    <div className="pointer-events-none absolute left-4 top-4 z-[400] rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-foreground shadow-sm">Alojamientos cerca de ti</div>
  </div>
}