'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import Link from 'next/link'
import { UNIVERSITIES, resolveUniversity } from '@/lib/universities'
import { getListingImageUrl } from '@/lib/supabase/storage'
import { generateDistanceLabel } from '@/lib/location'
import { ArrowRight, Bed, Check, GraduationCap, Home, MapPin, Sparkles, Wifi } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
export type HeroMapProps = {
  listings: any[]
  selectedUni: string
  onUniSelect: (storedValue: string) => void
  isMobile: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────
const AREQUIPA_CENTER: [number, number] = [-16.4000, -71.5300]
const INITIAL_ZOOM = 13

// ─── Icon Helpers ─────────────────────────────────────────────────────────────

// 1. Icono para Universidades (Círculo oscuro con birrete blanco y etiqueta inferior)
function createUniversityIcon(shortName: string, active: boolean) {
  const bg = active ? '#FACC15' : '#18181B'
  const iconColor = active ? '#18181B' : '#ffffff'
  const scale = active ? 1.15 : 1

  const html = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translate(-50%, -50%) scale(${scale});
      transition: transform 0.2s ease;
      cursor: pointer;
    ">
      <div style="
        width: 36px;
        height: 36px;
        border-radius: 9999px;
        background: ${bg};
        border: 2.5px solid #ffffff;
        box-shadow: 0 4px 12px rgba(24, 24, 27, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      </div>
      <span style="
        margin-top: 3px;
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.05em;
        color: #18181B;
        text-shadow: 0 1px 3px #ffffff, 0 0 3px #ffffff, 0 0 5px #ffffff;
        white-space: nowrap;
      ">
        ${shortName}
      </span>
    </div>
  `

  return L.divIcon({
    className: 'habitat-uni-icon-marker',
    html,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })
}

// 2. Icono para Alojamientos (Miniatura circular con borde blanco y punto amarillo)
function createListingThumbnailIcon(coverUrl: string | null) {
  const bgImage = coverUrl
    ? `background-image: url('${coverUrl}'); background-size: cover; background-position: center;`
    : `background: #FEF9C3; display: flex; align-items: center; justify-content: center;`

  const content = coverUrl
    ? ''
    : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#854D0E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`

  const html = `
    <div class="habitat-listing-pin-wrapper" style="
      position: relative;
      width: 44px;
      height: 44px;
      transform: translate(-50%, -50%);
      cursor: pointer;
    ">
      <div style="
        width: 44px;
        height: 44px;
        border-radius: 9999px;
        border: 3px solid #ffffff;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18), 0 2px 6px rgba(0,0,0,0.12);
        overflow: hidden;
        ${bgImage}
      ">
        ${content}
      </div>
      <div style="
        position: absolute;
        bottom: -3px;
        left: 50%;
        transform: translateX(-50%);
        width: 10px;
        height: 10px;
        background: #FACC15;
        border: 2px solid #ffffff;
        border-radius: 9999px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      "></div>
    </div>
  `

  return L.divIcon({
    className: 'habitat-listing-icon-marker',
    html,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -28],
  })
}

// ─── Map Controller (Sincroniza vuelos al seleccionar universidad) ─────────────
function MapController({ selectedUni }: { selectedUni: string }) {
  const map = useMap()
  const prevUni = useRef('')

  useEffect(() => {
    if (!selectedUni || selectedUni === prevUni.current) return
    prevUni.current = selectedUni
    const uni = UNIVERSITIES.find((u) => u.storedValue === selectedUni)
    if (uni) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) {
        map.setView([uni.lat, uni.lng], 15)
      } else {
        map.flyTo([uni.lat, uni.lng], 15, { duration: 1.2, easeLinearity: 0.35 })
      }
    }
  }, [selectedUni, map])

  return null
}

// ─── University Markers Layer ─────────────────────────────────────────────────
function UniversityMarkersLayer({
  selectedUni,
  onUniSelect,
}: {
  selectedUni: string
  onUniSelect: (storedValue: string) => void
}) {
  const map = useMap()
  const markersRef = useRef<L.Marker[]>([])

  const buildMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    UNIVERSITIES.forEach((uni) => {
      const active = uni.storedValue === selectedUni
      const icon = createUniversityIcon(uni.shortName, active)
      const marker = L.marker([uni.lat, uni.lng], {
        icon,
        interactive: true,
        zIndexOffset: active ? 300 : 200,
      }).addTo(map)

      marker.on('click', () => {
        onUniSelect(uni.storedValue)
      })

      marker.on('mouseover', () => {
        if (!active) {
          marker.setIcon(createUniversityIcon(uni.shortName, true))
        }
      })
      marker.on('mouseout', () => {
        if (uni.storedValue !== selectedUni) {
          marker.setIcon(createUniversityIcon(uni.shortName, false))
        }
      })

      markersRef.current.push(marker)
    })
  }, [map, selectedUni, onUniSelect])

  useEffect(() => {
    buildMarkers()
    return () => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
    }
  }, [buildMarkers])

  return null
}

// ─── Main HeroMapInner Component ──────────────────────────────────────────────
export default function HeroMapInner({
  listings,
  selectedUni,
  onUniSelect,
  isMobile,
}: HeroMapProps) {
  // Filtrar solo publicaciones con coordenadas válidas
  const validListings = listings.filter((l) => l.lat != null && l.lng != null)

  return (
    <>
      <style>{`
        /* Estilos limpios y desaturación sutil para el mapa */
        .leaflet-tile-pane {
          filter: saturate(0.85) contrast(1.02) brightness(0.99);
        }

        /* Quitar bordes y estilos por defecto de Leaflet en nuestros divIcons */
        .habitat-uni-icon-marker,
        .habitat-listing-icon-marker {
          background: transparent !important;
          border: none !important;
        }

        .habitat-listing-pin-wrapper {
          transition: transform 0.15s ease, filter 0.15s ease;
        }
        .habitat-listing-pin-wrapper:hover {
          transform: translate(-50%, -50%) scale(1.12) !important;
          filter: drop-shadow(0 8px 16px rgba(0,0,0,0.22));
          z-index: 500;
        }

        /* Popup flotante elegante para alojamientos */
        .habitat-hero-popup .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 20px;
          overflow: hidden;
          background: #ffffff;
          border: 1px solid #E4E4E7;
          box-shadow: 0 16px 36px -4px rgba(24, 24, 27, 0.2), 0 6px 16px -2px rgba(24, 24, 27, 0.12);
        }
        .habitat-hero-popup .leaflet-popup-content {
          margin: 0 !important;
          line-height: 1.4;
          width: 290px !important;
        }
        .habitat-hero-popup .leaflet-popup-close-button {
          color: #18181B !important;
          right: 10px !important;
          top: 10px !important;
          background: #ffffff !important;
          border-radius: 9999px;
          width: 26px !important;
          height: 26px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.18);
          font-size: 15px !important;
          line-height: 1 !important;
          z-index: 30;
          transition: background-color 0.15s;
        }
        .habitat-hero-popup .leaflet-popup-close-button:hover {
          background: #F4F2EB !important;
        }
        .habitat-hero-popup .leaflet-popup-tip-container {
          margin-top: -1px;
        }
        .habitat-hero-popup .leaflet-popup-tip {
          background: #ffffff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.12);
        }

        /* Botones de zoom modernos en esquina inferior izquierda */
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 12px rgba(24, 24, 27, 0.12) !important;
          border-radius: 12px !important;
          overflow: hidden;
          margin-left: 20px !important;
          margin-bottom: 70px !important;
        }
        .leaflet-control-zoom a {
          background-color: #ffffff !important;
          color: #18181B !important;
          border: 1px solid #E4E4E7 !important;
          width: 34px !important;
          height: 34px !important;
          line-height: 34px !important;
          font-weight: 800 !important;
          font-size: 16px !important;
          transition: background 0.15s;
        }
        .leaflet-control-zoom a:hover {
          background-color: #F4F2EB !important;
          color: #18181B !important;
        }

        /* Atribución sutil */
        .leaflet-control-attribution {
          font-size: 9px !important;
          background: rgba(255,255,255,0.7) !important;
          backdrop-filter: blur(4px);
          border-radius: 6px;
          margin: 4px !important;
          padding: 2px 6px !important;
        }
      `}</style>

      <MapContainer
        center={AREQUIPA_CENTER}
        zoom={INITIAL_ZOOM}
        scrollWheelZoom={false}
        dragging={true}
        zoomControl={false}
        attributionControl={true}
        className="absolute inset-0 h-full w-full"
        style={{ zIndex: 0 }}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
        />

        {/* Controles de Zoom en esquina inferior izquierda */}
        <ZoomControl position="bottomleft" />

        {/* Vuelo al cambiar universidad seleccionada */}
        <MapController selectedUni={selectedUni} />

        {/* Capa de Universidades */}
        <UniversityMarkersLayer selectedUni={selectedUni} onUniSelect={onUniSelect} />

        {/* Capa de Alojamientos reales */}
        {validListings.map((listing) => {
          let coverUrl: string | null = null
          if (listing.listing_images && listing.listing_images.length > 0) {
            const coverImg =
              listing.listing_images.find((i: any) => i.is_cover) || listing.listing_images[0]
            if (coverImg?.storage_path) {
              coverUrl = getListingImageUrl(coverImg.storage_path)
            }
          }

          const icon = createListingThumbnailIcon(coverUrl)
          const uniTarget = listing.university_nearby || selectedUni
          const distLabel =
            listing.distance_label ||
            (uniTarget ? generateDistanceLabel(listing.lat, listing.lng, uniTarget) : null)

          return (
            <Marker
              key={listing.id}
              position={[listing.lat, listing.lng]}
              icon={icon}
              zIndexOffset={100}
            >
              <Popup className="habitat-hero-popup">
                <article className="flex flex-col text-[#18181B]">
                  {/* Foto de cabecera */}
                  <div className="relative h-32 w-full bg-[#E4E4E7] overflow-hidden">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-xs font-semibold text-zinc-400">
                        Habitat
                      </div>
                    )}
                    {listing.verified && (
                      <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-[#047857]/95 backdrop-blur-sm px-2 py-0.5 text-[10px] font-black text-white shadow-sm">
                        <Check size={11} /> Verificado
                      </span>
                    )}
                  </div>

                  {/* Información */}
                  <div className="p-3.5 flex flex-col gap-2">
                    <div>
                      <h4 className="text-sm font-extrabold text-[#18181B] line-clamp-1 leading-snug">
                        {listing.title}
                      </h4>
                      <p className="mt-0.5 text-xs text-[#71717A] flex items-center gap-1">
                        <MapPin size={12} className="shrink-0 text-[#EAB308]" />
                        <span className="truncate">
                          {listing.district || 'Arequipa'}
                          {distLabel && ` · ${distLabel}`}
                        </span>
                      </p>
                    </div>

                    {/* Servicios destacados */}
                    {listing.amenities && listing.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {listing.amenities.slice(0, 3).map((amenity: string) => (
                          <span
                            key={amenity}
                            className="rounded-md bg-[#F4F2EB] px-1.5 py-0.5 text-[9px] font-bold text-[#52525B]"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Precio y CTA */}
                    <div className="mt-1 flex items-center justify-between pt-2 border-t border-[#F0F0F1]">
                      <div>
                        <span className="text-sm font-black text-[#18181B]">
                          S/ {listing.price_monthly ?? listing.price}
                        </span>
                        <span className="text-[10px] text-[#71717A] font-medium"> / mes</span>
                      </div>
                      <Link
                        href={`/alojamiento/${listing.id}`}
                        className="inline-flex items-center gap-1 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] px-3 py-1.5 text-xs font-black text-[#18181B] transition-colors shadow-sm"
                      >
                        Ver alojamiento <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </article>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </>
  )
}
