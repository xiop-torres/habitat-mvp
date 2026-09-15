import Link from 'next/link'

export type MapHome = {
  id: number | string
  title: string
  district: string
  price: number
  lat: number
  lng: number
}

const center = { lat: -16.3989, lng: -71.535 }

export default function HabitatMap({ homes, className = 'h-[440px]' }: { homes: MapHome[]; className?: string }) {
  return (
    <div className={`relative ${className} overflow-hidden rounded-3xl border border-border bg-[#e8eee2] shadow-sm`}>
      <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(90deg,rgba(24,24,27,.08)_1px,transparent_1px),linear-gradient(rgba(24,24,27,.08)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(250,204,21,.45),transparent_24%),radial-gradient(circle_at_75%_65%,rgba(16,185,129,.22),transparent_22%)]" />
      <div className="absolute left-[-8%] top-[36%] h-10 w-[116%] rotate-[-12deg] rounded-full bg-white/70 shadow-inner" />
      <div className="absolute left-[18%] top-[-10%] h-[120%] w-8 rotate-[18deg] rounded-full bg-white/55 shadow-inner" />
      <div className="absolute bottom-[14%] left-[-6%] h-8 w-[112%] rotate-[7deg] rounded-full bg-white/60 shadow-inner" />

      {homes.map((home, index) => {
        const left = clamp(50 + (home.lng - center.lng) * 2400 + index * 3, 10, 82)
        const top = clamp(50 - (home.lat - center.lat) * 2400 + index * 4, 12, 78)
        return (
          <Link
            key={home.id}
            href={`/alojamiento/${home.id}`}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-primary px-3 py-1.5 text-xs font-black shadow-lg transition hover:scale-105"
            style={{ left: `${left}%`, top: `${top}%` }}
            title={`${home.title} - ${home.district}`}
          >
            S/ {home.price}
          </Link>
        )
      })}

      <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-foreground shadow-sm">Alojamientos cerca de ti</div>
      <div className="pointer-events-none absolute bottom-4 left-4 z-20 max-w-[240px] rounded-2xl bg-white/95 p-3 text-xs text-muted-foreground shadow-sm">
        Ubicación referencial. La dirección exacta se comparte al confirmar una visita.
      </div>
    </div>
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
