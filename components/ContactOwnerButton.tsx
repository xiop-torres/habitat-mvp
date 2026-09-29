'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, MessageSquare } from 'lucide-react'
import { getOrCreateConversation } from '@/lib/supabase/messages'
import { useCurrentUserProfile } from '@/lib/supabase/useProfile'

interface Props {
  listingId: string
  listingStatus?: string
  className?: string
  children?: React.ReactNode
  icon?: React.ReactNode
}

export function ContactOwnerButton({ 
  listingId, 
  listingStatus, 
  className = "inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold hover:bg-primary-hover",
  children = "Contactar al propietario",
  icon = <MessageSquare size={16} />
}: Props) {
  const router = useRouter()
  const { profile, loading: authLoading } = useCurrentUserProfile()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ocultar completamente para owners
  if (!authLoading && profile?.role === 'owner') return null

  // Deshabilitar si el alojamiento no está publicado
  const isUnavailable = Boolean(listingStatus && listingStatus !== 'published')

  async function handleClick() {
    if (authLoading || loading) return

    if (!profile) {
      router.push('/login')
      return
    }

    if (isUnavailable) {
      setError('El alojamiento no está disponible actualmente.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const conversationId = await getOrCreateConversation(listingId)
      router.push(`/mensajes?conversation=${conversationId}`)
    } catch (err: any) {
      setError(err.message || 'Error al iniciar la conversación')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-1 w-full sm:w-auto">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || authLoading || isUnavailable}
        className={`${className} ${(loading || isUnavailable) ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
        {children}
      </button>
      {error && <span className="text-xs font-bold text-red-600 px-1">{error}</span>}
    </div>
  )
}
