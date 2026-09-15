import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowRight, MapPin, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export type RoomCardData = {
  id: string | number
  title: string
  district: string
  price: number
  distance: string
  image: string
  services?: string
  verified?: boolean
}

// Presentation only: the caller owns the existing favorite behavior and data.
export function RoomCard({ room, favoriteAction, className }: {
  room: RoomCardData
  favoriteAction?: ReactNode
  className?: string
}) {
  return (
    <article className={cn('group min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm', className)}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={room.image} alt={room.title} loading="lazy" className="size-full object-cover" />
        {room.verified && (
          <span className="absolute left-3 top-3 flex max-w-[calc(100%-5rem)] items-center gap-1 rounded-full bg-card px-2 py-1 text-xs font-semibold text-foreground">
            <ShieldCheck size={16} className="shrink-0 text-success" aria-hidden="true" />
            Alojamiento verificado
          </span>
        )}
        {favoriteAction && <div className="absolute right-3 top-3">{favoriteAction}</div>}
      </div>
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="min-w-0 flex-1 basis-40 font-semibold leading-snug wrap-break-word">{room.title}</h3>
          <p className="shrink-0 text-sm font-bold">
            S/ {room.price}<span className="block text-xs font-normal text-muted-foreground">/ mes</span>
          </p>
        </div>
        <p className="flex items-start gap-1 text-sm text-muted-foreground">
          <MapPin size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>{room.district} · {room.distance}</span>
        </p>
        {room.services && <p className="text-sm text-muted-foreground">{room.services}</p>}
        <Link href={`/alojamiento/${room.id}`} aria-label={`Ver alojamiento: ${room.title}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold hover:bg-secondary">
          Ver alojamiento <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}
