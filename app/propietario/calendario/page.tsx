'use client'

import { useState, useMemo, useEffect } from "react"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Video,
  Footprints,
  Calendar,
  Loader2,
  TriangleAlert,
  UserRound
} from "lucide-react"
import { AppHeader, Footer } from "@/components/Shared"
import { getOwnerVisits, type VisitRequest } from "@/lib/supabase/visits"
import { useCurrentUserProfile } from "@/lib/supabase/useProfile"
import { useRouter } from "next/navigation"

const WEEKDAYS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']

export default function OwnerCalendarPage() {
  const router = useRouter()
  const { profile, loading: authLoading } = useCurrentUserProfile()

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })
  
  const [visits, setVisits] = useState<VisitRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (profile?.role === 'student') {
      router.replace('/visitas')
      return
    }
    if (profile?.role === 'owner' || profile?.role === 'admin') {
      loadVisits()
    } else if (profile === null) {
      router.replace('/login')
    }
  }, [profile, authLoading])

  async function loadVisits() {
    try {
      const data = await getOwnerVisits()
      setVisits(data.filter(v => v.status === 'accepted' || v.status === 'rescheduled'))
    } catch (err: any) {
      setError(err.message || 'Error al cargar el calendario')
    } finally {
      setLoading(false)
    }
  }

  function prevMonth() {
    setCurrentMonth(prev => {
      const d = new Date(prev)
      d.setMonth(d.getMonth() - 1)
      return d
    })
  }

  function nextMonth() {
    setCurrentMonth(prev => {
      const d = new Date(prev)
      d.setMonth(d.getMonth() + 1)
      return d
    })
  }

  function goToday() {
    const d = new Date()
    setSelectedDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
    d.setDate(1)
    setCurrentMonth(d)
  }

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    
    // JS getDay() is 0=Sun, 1=Mon... we want 0=Mon, 6=Sun
    let startingDayOfWeek = firstDayOfMonth.getDay() - 1
    if (startingDayOfWeek === -1) startingDayOfWeek = 6
    
    const daysInMonth = lastDayOfMonth.getDate()
    
    const days = []
    
    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i)
      days.push({
        date: d,
        dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        isCurrentMonth: false
      })
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i)
      days.push({
        date: d,
        dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        isCurrentMonth: true
      })
    }
    
    // Next month padding to complete the grid (usually 42 cells total)
    let nextDays = 1
    while (days.length % 7 !== 0) {
      const d = new Date(year, month + 1, nextDays++)
      days.push({
        date: d,
        dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        isCurrentMonth: false
      })
    }
    
    return days
  }, [currentMonth])

  const visitsByDate = useMemo(() => {
    const map = new Map<string, VisitRequest[]>()
    visits.forEach(v => {
      if (!v.requested_date) return
      const arr = map.get(v.requested_date) || []
      arr.push(v)
      map.set(v.requested_date, arr)
    })
    return map
  }, [visits])

  const monthName = currentMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' })
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1)

  const selectedDayVisits = visitsByDate.get(selectedDate) || []

  if (authLoading || (profile?.role === 'student')) {
    return (
      <div className="min-h-screen bg-[#FBF8FC] flex flex-col">
        <AppHeader owner />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary size-12" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FBF8FC] text-[#1B1B1E]">
      <AppHeader owner />
      <main className="pt-5 pb-16">
        <div className="border-b border-[#E4E1E6] bg-white">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-4 py-3 text-xs text-[#554336] sm:px-6 lg:flex-row lg:items-center lg:px-8">
            <div className="flex flex-wrap items-center gap-2">
              <span>Inicio</span>
              <span>•</span>
              <span>Panel de Propietario</span>
              <span>•</span>
              <strong className="text-[#1B1B1E]">Calendario</strong>
            </div>
          </div>
        </div>
        
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Calendario de Visitas
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#554336]">
                Gestiona tus visitas presenciales y virtuales confirmadas o reprogramadas.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={goToday} className="rounded-lg bg-white shadow-sm border border-[#E4E1E6] px-4 py-2 text-sm font-bold hover:bg-[#F0EDF1]">
                Hoy
              </button>
              <div className="flex rounded-lg bg-white shadow-sm border border-[#E4E1E6] p-1">
                <button onClick={prevMonth} className="grid size-8 place-items-center rounded-md hover:bg-[#F0EDF1]">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={nextMonth} className="grid size-8 place-items-center rounded-md hover:bg-[#F0EDF1]">
                  <ChevronRight size={18} />
                </button>
              </div>
              <strong className="text-lg ml-2">{capitalizedMonth}</strong>
            </div>
          </div>

          {loading ? (
            <div className="mt-8 rounded-3xl bg-white p-10 flex flex-col items-center justify-center shadow-sm">
              <Loader2 size={40} className="animate-spin mb-4 text-[#8D4B00]" />
              <p className="text-sm font-bold">Cargando calendario...</p>
            </div>
          ) : error ? (
            <div className="mt-8 rounded-3xl bg-white p-10 flex flex-col items-center justify-center shadow-sm text-red-600">
              <TriangleAlert size={40} className="mb-4" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          ) : (
            <div className="mt-8 grid items-start gap-6 xl:grid-cols-12">
              <section className="min-w-0 overflow-hidden rounded-3xl bg-white shadow-sm xl:col-span-8">
                <div className="grid grid-cols-7 bg-[#F6F2F7] text-center border-b border-[#E4E1E6]">
                  {WEEKDAYS.map((day) => (
                    <div key={day} className="py-3 text-[11px] font-black text-[#554336]">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7">
                  {calendarDays.map((day, i) => {
                    const isSelected = day.dateStr === selectedDate
                    const dayVisits = visitsByDate.get(day.dateStr) || []
                    const todayStr = new Date().toISOString().split('T')[0]
                    const isToday = day.dateStr === todayStr
                    
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(day.dateStr)}
                        className={`min-h-[100px] sm:min-h-[120px] border-b border-r border-[#EAE7EB] p-2 flex flex-col items-start transition-colors relative hover:bg-[#F0EDF1]/50
                          ${!day.isCurrentMonth ? 'bg-[#F6F2F7]/50 text-[#887364]' : 'bg-white'}
                          ${isSelected ? 'ring-2 ring-inset ring-[#8D4B00] bg-[#FFFDF1]' : ''}
                        `}
                      >
                        <span className={`text-sm font-bold mb-1 rounded-full w-6 h-6 flex items-center justify-center ${isToday ? 'bg-[#FACC15] text-[#8D4B00]' : ''}`}>
                          {day.date.getDate()}
                        </span>
                        
                        <div className="w-full flex flex-col gap-1 overflow-y-auto max-h-[80px] sm:max-h-[100px] custom-scrollbar">
                          {dayVisits.map((v) => (
                            <div 
                              key={v.id} 
                              className={`text-left rounded px-1.5 py-1 text-[10px] sm:text-xs font-bold truncate
                                ${v.status === 'rescheduled' ? 'bg-[#FFF7CC] text-[#8D4B00]' : 'bg-[#D9FBE0] text-[#006E2D]'}`
                              }
                            >
                              {v.requested_time.split(' - ')[0]} - {v.student?.first_name || 'Estudiante'}
                            </div>
                          ))}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </section>

              <aside className="space-y-5 xl:col-span-4">
                <div className="rounded-3xl bg-white p-5 shadow-sm">
                  <h2 className="text-xl font-black mb-4">Visitas del {selectedDate}</h2>
                  
                  {selectedDayVisits.length === 0 ? (
                    <div className="py-10 text-center">
                      <CalendarDays size={40} className="mx-auto text-[#E4E1E6] mb-3" />
                      <p className="text-sm font-medium text-[#887364]">No hay visitas activas para este día.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedDayVisits.map((visit) => (
                        <div key={visit.id} className="rounded-2xl border border-[#E4E1E6] p-4 bg-[#FBF8FC]">
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase
                              ${visit.status === 'rescheduled' ? 'bg-[#FFF7CC] text-[#8D4B00]' : 'bg-[#D9FBE0] text-[#006E2D]'}`}>
                              {visit.status === 'rescheduled' ? 'Reprogramada' : 'Confirmada'}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-2 py-1 text-[10px] font-bold text-muted-foreground">
                                {visit.mode === 'virtual' ? <Video size={10} /> : <Footprints size={10} />}
                                {visit.mode === 'virtual' ? 'Virtual' : 'Presencial'}
                            </span>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-white border border-[#E4E1E6] text-sm font-black text-[#8D4B00]">
                              {visit.student?.first_name?.[0] || <UserRound size={16} />}
                            </div>
                            <div>
                              <h3 className="font-black text-sm">{visit.student?.first_name} {visit.student?.last_name}</h3>
                              {visit.listing?.title ? (
                                <p className="text-xs font-medium text-[#554336] truncate max-w-[200px]" title={visit.listing.title}>
                                  {visit.listing.title}
                                </p>
                              ) : (
                                <p className="text-xs font-medium text-red-600">Alojamiento no disponible</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <div className="rounded-xl bg-white p-2 border border-[#E4E1E6]">
                              <span className="block text-[9px] text-[#887364] font-bold uppercase">Modalidad</span>
                              <strong className="text-[11px] block mt-0.5">{visit.mode === 'virtual' ? 'Videollamada' : 'Presencial'}</strong>
                            </div>
                            <div className="rounded-xl bg-white p-2 border border-[#E4E1E6]">
                              <span className="block text-[9px] text-[#887364] font-bold uppercase">Horario</span>
                              <strong className="text-[11px] block mt-0.5 truncate" title={visit.requested_time}>{visit.requested_time}</strong>
                            </div>
                          </div>

                          {visit.message && (
                            <div className="mt-3 rounded-xl bg-white p-3 border border-[#E4E1E6]">
                              <p className="text-[10px] font-black uppercase text-[#887364] mb-1">
                                Mensaje
                              </p>
                              <p className="text-xs italic leading-5 text-[#554336]">
                                “{visit.message}”
                              </p>
                            </div>
                          )}

                          {visit.student?.phone && (
                            <a
                              href={`https://wa.me/${visit.student.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#006E2D] px-4 py-2.5 text-xs font-black text-white transition hover:bg-[#005c25]"
                            >
                              <MessageCircle size={15} /> WhatsApp
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E4E1E6; border-radius: 4px; }
      `}} />
    </div>
  )
}
