'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { AppHeader, EmptyState, Footer } from '@/components/Shared'
import { SecondaryButton } from '@/components/ui/button'
import { RoomCard } from '@/components/RoomCard'
import { mockRooms } from '@/lib/mocks'

export default function FavoritesPage() {
  const [saved, setSaved] = useState(mockRooms.slice(0, 3).map(room => room.id))
  const rooms = mockRooms.filter(room => saved.includes(room.id))

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold text-primary">Estudiante</p>
        <h1 className="mt-2 text-3xl font-bold">Mis favoritos</h1>
        <p className="mt-2 text-sm text-muted-foreground">Guarda los espacios que quieres comparar después.</p>
        <section className="mt-8">
          {rooms.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map(room => (
                <RoomCard
                  key={room.id}
                  room={room}
                  favoriteAction={
                    <SecondaryButton size="icon" aria-label="Quitar de favoritos" onClick={() => setSaved(current => current.filter(id => id !== room.id))} className="rounded-full">
                      <Heart className="fill-primary text-primary" size={17} />
                    </SecondaryButton>
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState title="Aún no tienes favoritos" copy="Cuando encuentres un alojamiento que te guste, toca el corazón para guardarlo aquí." action="Explorar alojamientos" href="/buscar" />
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
