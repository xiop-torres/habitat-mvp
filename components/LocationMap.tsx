'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { LocateFixed } from 'lucide-react'

// Fix default icon for Next.js
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

const customIcon = L.icon({
  iconUrl: typeof markerIcon === 'string' ? markerIcon : (markerIcon as any).src,
  iconRetinaUrl: typeof markerIcon2x === 'string' ? markerIcon2x : (markerIcon2x as any).src,
  shadowUrl: typeof markerShadow === 'string' ? markerShadow : (markerShadow as any).src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
})

const DEFAULT_CENTER = { lat: -16.3989, lng: -71.5350 }
const DEFAULT_ZOOM = 14

// Componente para actualizar el centro del mapa cuando cambian las coordenadas desde fuera (ej: ubicacion actual)
function MapUpdater({ lat, lng }: { lat: number | null; lng: number | null }) {
  const map = useMap()
  useEffect(() => {
    if (lat !== null && lng !== null) {
      map.setView([lat, lng], map.getZoom())
    }
  }, [lat, lng, map])
  return null
}

export default function LocationMap({ lat, lng, onChange }: { lat: number | null; lng: number | null; onChange: (lat: number | null, lng: number | null) => void }) {
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  const center = lat !== null && lng !== null ? { lat, lng } : DEFAULT_CENTER

  // Manejador de clics en el mapa
  function MapEvents() {
    useMapEvents({
      click(e) {
        onChange(e.latlng.lat, e.latlng.lng)
      },
    })
    return null
  }

  // Manejador de arrastre del marcador
  const markerRef = useRef<L.Marker>(null)
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          const newPos = marker.getLatLng()
          onChange(newPos.lat, newPos.lng)
        }
      },
    }),
    [onChange]
  )

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Tu navegador no soporta geolocalización.')
      return
    }

    setLoadingLocation(true)
    setGeoError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude)
        setLoadingLocation(false)
      },
      (err) => {
        console.warn('Geolocation error:', err)
        setGeoError('No pudimos acceder a tu ubicación. Asegúrate de haber dado permiso.')
        setLoadingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black">Ubica tu alojamiento en el mapa</p>
          <p className="text-xs text-muted-foreground">
            {lat && lng 
              ? 'Ubicación seleccionada. Puedes arrastrar el marcador o hacer clic en otra zona para ajustar.'
              : 'Haz clic en el mapa para colocar el marcador.'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={loadingLocation}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-secondary px-3 text-xs font-bold transition hover:bg-primary/20 disabled:opacity-50"
        >
          <LocateFixed size={14} />
          {loadingLocation ? 'Buscando...' : 'Usar mi ubicación'}
        </button>
      </div>

      {geoError && (
        <p className="text-xs font-semibold text-red-500">{geoError}</p>
      )}

      <div className="relative h-[400px] w-full overflow-hidden rounded-2xl border border-border bg-[#e8eee2] shadow-sm">
        <MapContainer
          center={center}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents />
          <MapUpdater lat={lat} lng={lng} />
          
          {lat !== null && lng !== null && (
            <Marker
              icon={customIcon}
              position={{ lat, lng }}
              draggable={true}
              eventHandlers={eventHandlers}
              ref={markerRef}
            />
          )}
        </MapContainer>
      </div>
    </div>
  )
}
