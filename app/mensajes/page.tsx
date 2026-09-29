'use client'

import { useEffect, useState, useMemo, useRef, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Lock,
  Paperclip,
  Search,
  Send,
  ShieldCheck,
  Loader2,
  TriangleAlert,
  MessageSquare,
  Home,
} from 'lucide-react'
import { AppHeader } from '@/components/Shared'
import { useCurrentUserProfile } from '@/lib/supabase/useProfile'
import {
  getMyConversations,
  getConversationMessages,
  sendMessage,
  markConversationAsRead,
  type Conversation,
  type Message,
} from '@/lib/supabase/messages'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { getListingImageUrl } from '@/lib/supabase/storage'
import { cn } from '@/lib/utils'

// ─── helpers ────────────────────────────────────────────────────────────────

function Avatar({ name, url, size = 12 }: { name: string; url?: string | null; size?: number }) {
  const cls = `size-${size} rounded-full object-cover`
  if (url)
    return <img src={url} alt={name} className={cls} />
  return (
    <div
      className={`grid size-${size} place-items-center rounded-full bg-[#EAE7EB] font-black text-[#554336]`}
      style={{ fontSize: size < 10 ? '0.9rem' : '1.1rem' }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

// ─── main component (wrapped in Suspense for useSearchParams) ───────────────

function MessagesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlConversationId = searchParams.get('conversation')
  const { profile, loading: authLoading } = useCurrentUserProfile()

  // ── state ──────────────────────────────────────────────────────────────────
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [convsError, setConvsError] = useState<string | null>(null)

  const [activeConvId, setActiveConvId] = useState<string | null>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [msgsError, setMsgsError] = useState<string | null>(null)

  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)

  // Track which conversation IDs have unread messages received by the current user.
  // Key = conversationId, value = true when there's at least one unread incoming msg.
  const [unreadConvIds, setUnreadConvIds] = useState<Set<string>>(new Set())

  const messagesEndRef = useRef<HTMLDivElement>(null)
  // Keep a stable ref of activeConvId for use inside realtime callbacks
  const activeConvIdRef = useRef<string | null>(null)
  activeConvIdRef.current = activeConvId

  const profileRef = useRef(profile)
  profileRef.current = profile

  const showChatMobile = activeConvId !== null

  // ── auth redirect ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && profile === null) router.replace('/login')
  }, [profile, authLoading, router])

  // ── load conversations ─────────────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    try {
      setLoadingConvs(true)
      setConvsError(null)
      const data = await getMyConversations()
      setConversations(data as any[])
    } catch (err: any) {
      setConvsError(err.message || 'Error al cargar las conversaciones')
    } finally {
      setLoadingConvs(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading || !profile) return
    loadConversations()
  }, [authLoading, profile, loadConversations])

  // ── select active conversation after load ──────────────────────────────────
  useEffect(() => {
    if (loadingConvs || conversations.length === 0) return

    const targetId = urlConversationId && conversations.some(c => c.id === urlConversationId)
      ? urlConversationId
      : conversations[0].id

    setActiveConvId(targetId)
    if (!urlConversationId || urlConversationId !== targetId) {
      router.replace(`/mensajes?conversation=${targetId}`)
    }
  // Only re-run when the list itself changes or when the URL param changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlConversationId, loadingConvs, conversations.length])

  // ── load messages when active conv changes ─────────────────────────────────
  const loadMessages = useCallback(async (convId: string) => {
    try {
      setLoadingMsgs(true)
      setMsgsError(null)
      const data = await getConversationMessages(convId)
      setMessages(data)
      // Mark received messages as read and clear unread indicator
      await markConversationAsRead(convId)
      setUnreadConvIds(prev => {
        const next = new Set(prev)
        next.delete(convId)
        return next
      })
    } catch (err: any) {
      setMsgsError(err.message || 'Error al cargar los mensajes')
    } finally {
      setLoadingMsgs(false)
    }
  }, [])

  useEffect(() => {
    if (!activeConvId) return
    loadMessages(activeConvId)
  }, [activeConvId, loadMessages])

  // ── auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Realtime subscription ──────────────────────────────────────────────────
  // We subscribe to ALL messages INSERT on conversations where the user is a participant.
  // Supabase Realtime + RLS ensures only authorized rows are pushed to us.
  // We use a single channel and differentiate by conversation_id in the handler.
  useEffect(() => {
    if (!profile) return

    const supabase = createSupabaseBrowserClient()

    const channel = supabase
      .channel(`messages-inbox-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const incoming = payload.new as Message
          const currentActiveId = activeConvIdRef.current
          const currentProfile = profileRef.current

          if (!currentProfile) return

          if (incoming.conversation_id === currentActiveId) {
            // Chat is open: add message (deduplicating by id) and mark as read
            setMessages(prev => {
              if (prev.some(m => m.id === incoming.id)) return prev
              return [...prev].concat(incoming).sort(
                (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              )
            })
            // If the message came from the other person, mark it read immediately
            if (incoming.sender_id !== currentProfile.id) {
              markConversationAsRead(incoming.conversation_id)
            }
          } else {
            // Message arrived for a different conversation
            if (incoming.sender_id !== currentProfile.id) {
              setUnreadConvIds(prev => {
                const next = new Set(prev)
                next.add(incoming.conversation_id)
                return next
              })
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile]) // Re-subscribe only when profile changes (login/logout)

  // ── send message ───────────────────────────────────────────────────────────
  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!activeConvId || !newMessage.trim() || sending) return

    const text = newMessage.trim()
    if (text.length > 1000) {
      alert('El mensaje es demasiado largo (máximo 1000 caracteres)')
      return
    }

    try {
      setSending(true)
      // sendMessage returns the inserted row; add it optimistically to avoid waiting
      // for the Realtime echo (which also deduplicates by id).
      const sent = await sendMessage(activeConvId, text) as Message
      setNewMessage('')
      setMessages(prev => {
        if (prev.some(m => m.id === sent.id)) return prev
        return [...prev, sent]
      })
    } catch (err: any) {
      alert(err.message || 'Error al enviar el mensaje')
    } finally {
      setSending(false)
    }
  }

  // ── conversation selection ─────────────────────────────────────────────────
  function handleSelectConversation(id: string) {
    setActiveConvId(id)
    router.push(`/mensajes?conversation=${id}`)
  }

  function handleBackToList() {
    setActiveConvId(null)
    router.push('/mensajes')
  }

  const activeConversation = useMemo(
    () => conversations.find(c => c.id === activeConvId),
    [activeConvId, conversations]
  )

  // ── loading / auth guard ───────────────────────────────────────────────────
  if (authLoading || profile === null) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FBF8FC]">
        <AppHeader />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="size-12 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col bg-[#FBF8FC] text-[#1B1B1E]">
      <AppHeader owner={profile.role === 'owner'} />

      <main className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
        {/* ── SIDEBAR ── */}
        <aside
          className={cn(
            'flex w-full flex-col border-r border-[#E4E1E6] bg-white md:w-[350px] lg:w-[400px]',
            showChatMobile ? 'hidden md:flex' : 'flex'
          )}
        >
          <div className="border-b border-[#E4E1E6] p-4">
            <h1 className="text-xl font-black">Mensajes</h1>
            <div className="mt-4 flex items-center rounded-xl bg-[#F0EDF1] px-3 py-2 text-sm">
              <Search className="mr-2 shrink-0 text-[#887364]" size={16} />
              <input
                type="text"
                placeholder="Buscar conversación..."
                className="w-full bg-transparent font-medium outline-none placeholder:text-[#887364]"
              />
            </div>
          </div>

          <div className="custom-scrollbar flex-1 overflow-y-auto">
            {loadingConvs ? (
              <div className="flex items-center justify-center p-10">
                <Loader2 className="size-8 animate-spin text-primary" />
              </div>
            ) : convsError ? (
              <div className="p-6 text-center text-red-600">
                <TriangleAlert size={32} className="mx-auto mb-2" />
                <p className="text-sm font-bold">{convsError}</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-10 text-center text-[#887364]">
                <MessageSquare size={40} className="mx-auto mb-4 opacity-50" />
                <p className="text-sm font-bold">No tienes mensajes todavía.</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = conv.id === activeConvId
                const hasUnread = unreadConvIds.has(conv.id)
                const otherPerson = profile.role === 'student' ? conv.owner : conv.student
                const name = `${otherPerson?.first_name || 'Usuario'} ${otherPerson?.last_name || ''}`.trim()
                const listingTitle = (conv as any).listing?.title || 'Alojamiento no disponible'

                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={cn(
                      'flex w-full items-start gap-3 border-b border-[#E4E1E6] p-4 text-left transition',
                      isSelected ? 'bg-[#F0EDF1] shadow-inner' : 'hover:bg-[#F6F2F7]'
                    )}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <Avatar name={name} url={otherPerson?.avatar_url} size={12} />
                      {/* Unread dot */}
                      {hasUnread && !isSelected && (
                        <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-white bg-[#10B981]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className={cn('truncate', hasUnread && !isSelected ? 'font-black' : 'font-bold')}>
                          {name}
                        </h3>
                        <div className="flex shrink-0 items-center gap-1.5">
                          {hasUnread && !isSelected && (
                            <span className="inline-flex size-2 rounded-full bg-[#10B981]" />
                          )}
                          <span className="text-[10px] font-bold text-[#887364]">
                            {new Date(conv.updated_at).toLocaleDateString('es-ES', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      <p className="mt-0.5 truncate text-xs font-bold text-[#006E2D]">
                        {listingTitle}
                      </p>
                      <p className={cn('mt-1 truncate text-[11px]', hasUnread && !isSelected ? 'font-bold text-[#1B1B1E]' : 'text-[#887364]')}>
                        {hasUnread && !isSelected ? 'Nuevo mensaje' : 'Abrir conversación...'}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </aside>

        {/* ── CHAT AREA ── */}
        <section
          className={cn(
            'flex flex-1 flex-col bg-[#FBF8FC]',
            !showChatMobile ? 'hidden md:flex' : 'flex'
          )}
        >
          {activeConversation ? (
            <>
              {/* Chat header */}
              <div className="flex flex-col border-b border-[#E4E1E6] bg-white lg:flex-row">
                <div className="flex flex-1 items-center gap-3 p-4">
                  <button
                    type="button"
                    onClick={handleBackToList}
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-[#F0EDF1] md:hidden"
                  >
                    <ArrowLeft size={20} />
                  </button>

                  {(() => {
                    const other =
                      profile.role === 'student'
                        ? (activeConversation as any).owner
                        : (activeConversation as any).student
                    const name = `${other?.first_name || 'Usuario'} ${other?.last_name || ''}`.trim()
                    return (
                      <>
                        <Avatar name={name} url={other?.avatar_url} size={10} />
                        <div>
                          <h2 className="flex items-center gap-2 font-black leading-tight">
                            {name}
                            {profile.role === 'owner' && (
                              <span className="rounded-full bg-[#FFF7CC] px-2 py-0.5 text-[9px] uppercase tracking-wider text-[#8D4B00]">
                                Estudiante
                              </span>
                            )}
                            {profile.role === 'student' && (
                              <span className="rounded-full bg-[#EAE7EB] px-2 py-0.5 text-[9px] uppercase tracking-wider text-[#554336]">
                                Propietario
                              </span>
                            )}
                          </h2>
                          <div className="flex items-center gap-1 text-[11px] font-bold text-[#006E2D]">
                            <ShieldCheck size={12} /> Cuenta verificada
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </div>

                {/* Listing info */}
                <div className="flex items-center gap-3 border-t border-[#E4E1E6] bg-[#F6F2F7] p-3 lg:border-l lg:border-t-0 lg:bg-transparent">
                  <div className="size-12 shrink-0 overflow-hidden rounded-xl bg-[#EAE7EB]">
                    {(activeConversation as any).listing?.listing_images?.[0] ? (
                      <img
                        src={getListingImageUrl(
                          (activeConversation as any).listing.listing_images[0].storage_path
                        )}
                        alt="Alojamiento"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <Home size={16} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-black uppercase tracking-wider text-[#887364]">
                      Alojamiento
                    </p>
                    <p className="truncate text-xs font-black">
                      {(activeConversation as any).listing?.title || 'Alojamiento no disponible'}
                    </p>
                    {(activeConversation as any).listing && (
                      <Link
                        href={`/alojamiento/${(activeConversation as any).listing.id}`}
                        className="mt-0.5 text-[10px] font-bold text-[#8D4B00] hover:underline"
                      >
                        Ver detalles
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages list */}
              <div className="custom-scrollbar flex flex-1 flex-col overflow-y-auto p-4">
                <div className="mx-auto mb-6 max-w-sm rounded-2xl bg-[#FFF7CC] p-3 text-center text-[10px] text-[#8D4B00]">
                  <Lock className="mx-auto mb-1 size-3" />
                  <strong>Chat Seguro Habitat</strong>
                  <br />
                  Nunca transfieras dinero fuera de la plataforma ni compartas datos bancarios.
                </div>

                {loadingMsgs ? (
                  <div className="flex flex-1 items-center justify-center p-10">
                    <Loader2 className="size-8 animate-spin text-primary" />
                  </div>
                ) : msgsError ? (
                  <div className="flex-1 p-6 text-center text-red-600">
                    <TriangleAlert size={32} className="mx-auto mb-2" />
                    <p className="text-sm font-bold">{msgsError}</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center p-10 text-center text-[#887364]">
                    <MessageSquare size={40} className="mb-4 opacity-30" />
                    <p className="text-sm font-bold">Aún no hay mensajes</p>
                    <p className="text-xs">Escribe algo para iniciar la conversación.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {messages.map((msg) => {
                      const isMe = msg.sender_id === profile.id
                      const time = new Date(msg.created_at).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            'flex w-full max-w-[85%] flex-col gap-1 sm:max-w-[70%]',
                            isMe ? 'self-end items-end' : 'self-start items-start'
                          )}
                        >
                          <div
                            className={cn(
                              'rounded-2xl px-4 py-2 text-sm',
                              isMe
                                ? 'rounded-br-sm bg-[#18181B] text-white'
                                : 'rounded-bl-sm border border-[#E4E1E6] bg-white text-[#1B1B1E]'
                            )}
                          >
                            {msg.body}
                          </div>
                          <span className="text-[9px] font-bold text-[#887364]">{time}</span>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-[#E4E1E6] bg-white p-3 sm:p-4">
                <form
                  onSubmit={handleSendMessage}
                  className="mx-auto flex w-full max-w-4xl items-end gap-2 rounded-3xl bg-[#F0EDF1] p-2 focus-within:ring-2 focus-within:ring-[#18181B]"
                >
                  <button
                    type="button"
                    aria-label="Adjuntar"
                    className="grid size-10 shrink-0 place-items-center rounded-full text-[#887364] transition hover:bg-[#E4E1E6] hover:text-[#18181B]"
                  >
                    <Paperclip size={18} />
                  </button>
                  <textarea
                    rows={1}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    maxLength={1000}
                    className="custom-scrollbar max-h-32 min-h-[40px] w-full resize-none bg-transparent py-2.5 text-sm outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(e)
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    aria-label="Enviar mensaje"
                    className={cn(
                      'grid size-10 shrink-0 place-items-center rounded-full bg-[#18181B] text-white transition',
                      !newMessage.trim() || sending ? 'cursor-not-allowed opacity-50' : 'hover:scale-105'
                    )}
                  >
                    {sending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} className="mr-0.5" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="hidden flex-1 flex-col items-center justify-center p-10 text-center text-[#887364] md:flex">
              <MessageSquare size={64} className="mb-4 opacity-20" />
              <h2 className="mb-2 text-xl font-black text-[#1B1B1E]">Tus mensajes</h2>
              <p className="max-w-sm text-sm">
                Selecciona una conversación del panel izquierdo para leer los mensajes o enviar uno nuevo.
              </p>
            </div>
          )}
        </section>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #E4E1E6; border-radius: 10px; }
        `
      }} />
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="size-12 animate-spin text-primary" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  )
}
