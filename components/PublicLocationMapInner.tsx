'use client'

import { MapContainer, TileLayer, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function PublicLocationMapInner({ lat, lng, className = 'h-[300px] sm:h-[360px]' }: { lat: number; lng: number; className?: string }) {
  const center = { lat, lng }

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl border border-border bg-[#e8eee2] shadow-sm ${className}`}>
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Circle
          center={center}
          pathOptions={{ fillColor: '#FACC15', color: '#eab308', fillOpacity: 0.4 }}
          radius={200}
        />
      </MapContainer>
    </div>
  )
}
