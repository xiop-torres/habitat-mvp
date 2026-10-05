'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import Link from 'next/link'
import { Home, MapPin } from 'lucide-react'

// Crear un icono personalizado con el precio y casita, centrado y con el 'pin' exacto
const createPriceIcon = (price: number) => {
  const html = `
    <div class="absolute left-0 bottom-0 flex flex-col items-center justify-center bg-[#FACC15] text-[#18181B] font-black rounded-[10px] border-2 border-white px-2.5 py-1 -translate-x-1/2" style="white-space: nowrap; filter: drop-shadow(0 4px 3px rgb(0 0 0 / 0.15));">
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" class="mb-0.5">
        <path d="M12 3l8 6v12h-5v-7H9v7H4V9l8-6z"/>
      </svg>
      <span class="text-[13px] tracking-tight leading-none">S/ ${price}</span>
      <div class="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white"></div>
      <div class="absolute -bottom-[4px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-[#FACC15]"></div>
    </div>
  `
  return L.divIcon({
    className: 'bg-transparent border-0',
    html: html,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -46],
  })
}

export type MapHome = {
  id: number | string
  title: string
  district: string
  price: number
  lat: number
  lng: number
  coverUrl?: string | null
}

const AREQUIPA_CENTER: [number, number] = [-16.39889, -71.535]

export default function HabitatMapInner({ homes, className = 'h-[440px]' }: { homes: MapHome[]; className?: string }) {
  const hasHomes = homes.length > 0
  
  const bounds = hasHomes
    ? L.latLngBounds(homes.map(h => [h.lat, h.lng]))
    : null

  const center = hasHomes ? bounds!.getCenter() : AREQUIPA_CENTER
  
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return <div className={`${className} bg-[#F4F2EB] flex items-center justify-center animate-pulse`} />

  return (
    <div className={`relative ${className} overflow-hidden rounded-3xl border border-[#E4E4E7] shadow-sm`}>
      <style>{`
        .custom-habitat-popup .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        }
        .custom-habitat-popup .leaflet-popup-content {
          margin: 0 !important;
          width: min(300px, calc(100vw - 32px)) !important;
        }
        .custom-habitat-popup .leaflet-popup-close-button {
          color: #18181B !important;
          right: 8px !important;
          top: 8px !important;
          background: white !important;
          border-radius: 999px;
          width: 24px !important;
          height: 24px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          padding: 0 !important;
          font-size: 16px !important;
          line-height: 1 !important;
          z-index: 10;
        }
        .custom-habitat-popup .leaflet-popup-close-button:hover {
          background: #F4F2EB !important;
        }
        .custom-habitat-popup .leaflet-popup-tip-container {
          margin-top: -1px;
        }
      `}</style>

      <MapContainer
        center={center}
        zoom={hasHomes ? (homes.length === 1 ? 15 : 13) : 12}
        bounds={hasHomes && homes.length > 1 ? bounds!.pad(0.1) : undefined}
        className="h-full w-full z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {homes.map((home) => (
          <div key={home.id}>
            <Circle
              center={[home.lat, home.lng]}
              radius={200}
              pathOptions={{
                color: '#FACC15',
                fillColor: '#FACC15',
                fillOpacity: 0.15,
                weight: 1,
              }}
            />
            <Marker position={[home.lat, home.lng]} icon={createPriceIcon(home.price)}>
              <Popup className="custom-habitat-popup">
                <div className="flex p-3 gap-3 pb-0">
                  {/* Foto */}
                  <div className="w-[84px] h-[96px] shrink-0 rounded-xl overflow-hidden bg-zinc-100">
                    {home.coverUrl ? (
                      <img src={home.coverUrl} alt={home.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-zinc-300">
                        <Home size={28} strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex flex-col flex-1 min-w-0 pr-4 justify-between">
                    <div>
                      <span className="inline-block self-start rounded bg-[#FFF7CC] px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-[#18181B] mb-1">
                        Zona aprox
                      </span>
                      <h3 className="text-[13px] font-black text-[#18181B] leading-tight line-clamp-2">{home.title}</h3>
                      <p className="flex items-center gap-1 text-[11px] font-medium text-[#71717A] truncate mt-1">
                        <MapPin size={11} className="shrink-0" /> <span className="truncate">{home.district}</span>
                      </p>
                    </div>
                    
                    <p className="text-[15px] font-black text-[#18181B]">
                      S/ {home.price} <span className="text-[9px] font-medium text-[#71717A] font-normal">/ mes</span>
                    </p>
                  </div>
                </div>
                
                {/* Botón CTA */}
                <div className="px-3 pb-3 mt-3">
                  <Link 
                    href={`/alojamiento/${home.id}`} 
                    style={{ color: '#18181B' }}
                    className="flex items-center justify-center w-full bg-[#FACC15] h-9 text-[13px] font-black rounded-xl hover:bg-[#EAB308] transition shadow-sm"
                  >
                    Ver alojamiento &rarr;
                  </Link>
                </div>
              </Popup>
            </Marker>
          </div>
        ))}
      </MapContainer>

      {!hasHomes && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] max-w-[280px] rounded-2xl bg-white/95 p-4 text-xs text-center font-bold text-[#71717A] shadow-lg border border-[#E4E4E7]">
          Los alojamientos mostrados aún no tienen ubicación en el mapa.
        </div>
      )}
    </div>
  )
}
