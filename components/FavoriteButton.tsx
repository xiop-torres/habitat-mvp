'use client'

import { useState, useEffect } from 'react'
import { Heart, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { isListingFavorite, addFavorite, removeFavorite } from '@/lib/supabase/favorites'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  listingId: string
  variant?: 'card' | 'detail'
  initialIsFavorite?: boolean
  onToggle?: (isFavorite: boolean) => void
}

export function FavoriteButton({ listingId, variant = 'card', initialIsFavorite, onToggle }: FavoriteButtonProps) {
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite ?? false)
  const [loading, setLoading] = useState(initialIsFavorite === undefined)
  const [processing, setProcessing] = useState(false)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function checkStatus() {
      const supabase = createSupabaseBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle()
        if (profile && mounted) {
          setRole(profile.role)
          if (profile.role === 'student' || profile.role === 'admin') {
            if (initialIsFavorite === undefined) {
              const status = await isListingFavorite(listingId)
              if (mounted) setIsFavorite(status)
            }
          }
        }
      }
      if (mounted) setLoading(false)
    }
    
    checkStatus()
    return () => { mounted = false }
  }, [listingId, initialIsFavorite])

  if (role === 'owner') return null

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (processing || loading) return

    const supabase = createSupabaseBrowserClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      router.push('/login')
      return
    }

    setProcessing(true)

    try {
      if (isFavorite) {
        const success = await removeFavorite(listingId)
        if (success) {
          setIsFavorite(false)
          onToggle?.(false)
        }
      } else {
        const success = await addFavorite(listingId)
        if (success) {
          setIsFavorite(true)
          onToggle?.(true)
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setProcessing(false)
    }
  }

  if (variant === 'detail') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={processing || loading}
        aria-label={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
        className={cn(
          "inline-flex min-h-10 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition disabled:opacity-50",
          isFavorite ? 'border-[#FACC15] bg-[#FFF7CC]' : 'border-[#D4D4D8] bg-white hover:bg-gray-50'
        )}
      >
        {processing ? (
          <Loader2 size={14} className="animate-spin text-muted-foreground" />
        ) : (
          <Heart size={14} className={isFavorite ? 'fill-[#FACC15] text-[#FACC15]' : ''} />
        )}
        {isFavorite ? 'Guardado' : 'Guardar'}
      </button>
    )
  }

  // variant === 'card'
  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={processing || loading}
      aria-label={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
      className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-white/85 text-[#52525B] shadow-sm transition hover:bg-white disabled:opacity-50"
    >
      {processing ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        <Heart size={15} className={isFavorite ? 'fill-[#FACC15] text-[#FACC15]' : ''} />
      )}
    </button>
  )
}
