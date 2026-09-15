"use client";

import { useState } from "react";
import {
  CalendarDays,
  CalendarPlus as MoreTime,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Edit3,
  Filter,
  HelpCircle,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";
import { AppHeader, Footer } from "@/components/Shared";

const days = [
  { day: "LUN", date: "14" },
  { day: "MAR", date: "15" },
  { day: "MIÉ", date: "16" },
  { day: "JUE", date: "17" },
  { day: "VIE", date: "18" },
  { day: "SÁB", date: "19", today: true },
  { day: "DOM", date: "20", muted: true },
];
const hours = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
];
const events = [
  {
    day: 1,
    hour: 2,
    title: "Renato Díaz",
    subtitle: "UNSA Ing. Civil",
    label: "REALIZADA",
    tone: "muted",
  },
  {
    day: 2,
    hour: 8,
    title: "Mariana Ticona",
    subtitle: "Depto Cayma",
    label: "PRESENCIAL",
    tone: "green",
  },
  {
    day: 3,
    hour: 2,
    title: "Mateo Quispe",
    subtitle: "Postulante Cusco",
    label: "MEET",
    tone: "gray",
  },
  {
    day: 3,
    hour: 8,
    title: "Lucía Vega",
    subtitle: "Mini Cayma (UCSM)",
    label: "POR CONFIRMAR",
    tone: "yellow",
  },
  {
    day: 4,
    hour: 3,
    title: "Gabriel Pinto",
    subtitle: "Hab. Yanahuara",
    label: "PRESENCIAL",
    tone: "green",
  },
  {
    day: 5,
    hour: 2,
    title: "Diego Rodríguez",
    subtitle: "Yanahuara UCSM",
    label: "EN 15 MIN",
    tone: "selected",
  },
  {
    day: 5,
    hour: 3,
    title: "Sebastián Cárdenas",
    subtitle: "Habitación Yanahuara",
    label: "POR CONFIRMAR",
    tone: "yellow",
  },
  {
    day: 5,
    hour: 8,
    title: "Valeria Ramos",
    subtitle: "San Pablo Derecho",
    label: "MEET",
    tone: "gray",
  },
];

const metrics: { value: string; caption: string; tone: "green" | "yellow" | "gray"; Icon: LucideIcon }[] = [
  { value: "7 Visitas", caption: "4 presenciales • 3 virtuales", tone: "green", Icon: CalendarDays },
  { value: "2 Por confirmar", caption: "Requiere tu respuesta", tone: "yellow", Icon: Clock3 },
  { value: "18 Horas libres", caption: "Habilitadas en agenda", tone: "gray", Icon: Clock3 },
  { value: "98% Asistencia", caption: "Puntualidad en campus", tone: "green", Icon: ShieldCheck },
];

export default function OwnerCalendarPage() {
  const [selectedEvent, setSelectedEvent] = useState(events[5]);
  const [modality, setModality] = useState("Todos");
  const [showAvailability, setShowAvailability] = useState(false);

  const visibleEvents = events.filter(
    (event) =>
      modality === "Todos" ||
      (modality === "Presencial" && event.label === "PRESENCIAL") ||
      (modality === "Virtual" && event.label === "MEET"),
  );

  return (
    <div className="min-h-screen bg-[#FBF8FC] text-[#1B1B1E]">
      <AppHeader owner />
      <main className="pt-5">
        <div className="border-b border-[#E4E1E6] bg-white">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-4 py-3 text-xs text-[#554336] sm:px-6 lg:flex-row lg:items-center lg:px-8">
            <div className="flex flex-wrap items-center gap-2">
              <span>Inicio</span>
              <span>›</span>
              <span>Panel de Propietario</span>
              <span>›</span>
              <span>Solicitudes de Visita</span>
              <span>›</span>
              <strong className="text-[#1B1B1E]">Calendario Semanal</strong>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0EDF1] px-3 py-1">
                <span className="size-2 rounded-full bg-[#006E2D]" /> Google
                Calendar sincronizado hace 12 min
              </span>
              <button
                type="button"
                className="inline-flex items-center gap-1 font-bold text-[#8D4B00]"
              >
                <HelpCircle size={14} /> Guía del Arrendador
              </button>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#FACC15] px-2.5 py-1 text-[11px] font-black">
                  Gestión de Agenda Activa
                </span>
                <span className="text-xs text-[#554336]">
                  • Ciclo 2024-II Arequipa
                </span>
              </div>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Calendario y Horarios de Visita
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#554336]">
                Organiza tus visitas presenciales y virtuales con postulantes
                universitarios de UCSM, UNSA y San Pablo.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex rounded-xl bg-[#F0EDF1] p-1">
                <button
                  type="button"
                  className="rounded-lg px-3 py-2 text-xs font-bold text-[#554336]"
                >
                  Lista (9)
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-white px-3 py-2 text-xs font-black shadow-sm"
                >
                  <CalendarDays className="mr-1 inline size-4 text-[#8D4B00]" />{" "}
                  Semana
                </button>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold shadow-sm"
              >
                <Settings2 size={15} className="text-[#8D4B00]" /> Bloquear
                horario
              </button>
              <button
                type="button"
                onClick={() => setShowAvailability(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#FACC15] px-4 py-2 text-xs font-black shadow-sm"
              >
                <MoreTime size={16} /> Añadir franja libre
              </button>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {metrics.map(({ value, caption, tone, Icon }) => (
              <div
                key={String(value)}
                className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
              >
                <div
                  className={`grid size-12 shrink-0 place-items-center rounded-xl ${tone === "yellow" ? "bg-[#FACC15]" : tone === "green" ? "bg-[#7CF994]" : "bg-[#EAE7EB]"}`}
                >
                  <Icon className="size-6" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-black sm:text-lg">
                    {value}
                  </p>
                  <p
                    className={`mt-1 truncate text-[11px] ${tone === "yellow" ? "font-bold text-[#8D4B00]" : "text-[#554336]"}`}
                  >
                    {caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col justify-between gap-3 rounded-2xl bg-white p-3 shadow-sm md:flex-row md:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="rounded-lg bg-[#F0EDF1] px-3 py-2 text-xs font-bold"
              >
                Hoy
              </button>
              <div className="flex rounded-lg bg-[#F0EDF1] p-0.5">
                <button
                  type="button"
                  aria-label="Semana anterior"
                  className="grid size-8 place-items-center rounded-md"
                >
                  <ChevronLeft size={17} />
                </button>
                <button
                  type="button"
                  aria-label="Semana siguiente"
                  className="grid size-8 place-items-center rounded-md"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
              <strong className="text-sm">14 – 20 de Octubre, 2024</strong>
              <span className="rounded bg-[#F0EDF1] px-2 py-1 text-[10px] font-bold text-[#554336]">
                Semana 42
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select className="rounded-xl bg-[#F0EDF1] px-3 py-2 text-xs font-bold">
                <option>Todas mis propiedades (3)</option>
                <option>Habitación Yanahuara</option>
                <option>Mini departamento Cayma</option>
              </select>
              <div className="flex rounded-xl bg-[#F0EDF1] p-1">
                {["Todos", "Presencial", "Virtual"].map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setModality(item)}
                    className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${modality === item ? "bg-white shadow-sm" : "text-[#554336]"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <button
                type="button"
                aria-label="Configuración de calendario"
                className="grid size-9 place-items-center rounded-xl bg-[#F0EDF1]"
              >
                <SlidersHorizontal size={16} />
              </button>
            </div>
          </div>
          <div className="mt-6 grid items-start gap-6 xl:grid-cols-12">
            <section className="min-w-0 overflow-hidden rounded-3xl bg-white shadow-sm xl:col-span-8">
              <div className="overflow-x-auto">
                <div className="min-w-[850px]">
                  <div className="grid grid-cols-[72px_repeat(7,minmax(110px,1fr))] bg-[#F6F2F7] text-center">
                    {[{ day: "GMT-5", date: "" }, ...days].map(
                      (item, index) => (
                        <div
                          key={`${item.day}-${item.date}`}
                          className={`relative border-r border-[#E4E1E6] px-2 py-3 ${item.today ? "bg-[#FFF7CC]" : ""} ${item.muted ? "text-[#887364]" : ""}`}
                        >
                          {item.today && (
                            <span className="absolute left-1/2 top-1 -translate-x-1/2 rounded-full bg-[#FACC15] px-2 py-0.5 text-[9px] font-black uppercase">
                              Hoy
                            </span>
                          )}
                          <span className="block text-[10px] font-bold">
                            {item.day}
                          </span>
                          <strong className="mt-1 block text-xl font-black">
                            {item.date}
                          </strong>
                        </div>
                      ),
                    )}
                  </div>
                  <div className="grid grid-cols-[72px_repeat(7,minmax(110px,1fr))]">
                    <div className="bg-white">
                      {hours.map((hour) => (
                        <div
                          key={hour}
                          className="h-20 border-b border-[#EAE7EB] px-2 pt-1 text-right text-[10px] font-bold text-[#887364]"
                        >
                          {hour}
                        </div>
                      ))}
                    </div>
                    {days.map((day, dayIndex) => (
                      <div
                        key={day.date}
                        className={`relative border-r border-[#EAE7EB] ${day.today ? "bg-[#FFFDF1]" : day.muted ? "bg-[#F6F2F7]/60" : ""}`}
                      >
                        {hours.map((hour, hourIndex) => {
                          const event = visibleEvents.find(
                            (item) =>
                              item.day === dayIndex && item.hour === hourIndex,
                          );
                          return (
                            <div
                              key={`${day.date}-${hour}`}
                              className="relative h-20 border-b border-[#EAE7EB] p-1"
                            >
                              {event && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedEvent(event)}
                                  className={`h-full w-full rounded-xl border p-2 text-left transition hover:scale-[1.02] ${event.tone === "selected" ? "border-[#006E2D] bg-[#7CF994] ring-2 ring-[#006E2D]" : event.tone === "green" ? "border-[#7CF994] bg-[#D9FBE0]" : event.tone === "yellow" ? "border-[#FACC15] bg-[#FFF7CC]" : event.tone === "muted" ? "border-[#E4E1E6] bg-[#F0EDF1] opacity-80" : "border-[#E4E1E6] bg-[#EAE7EB]"}`}
                                >
                                  <span className="block truncate text-[9px] font-black">
                                    {event.label}
                                  </span>
                                  <span className="mt-1 block truncate text-[11px] font-black">
                                    {event.title}
                                  </span>
                                  <span className="mt-1 block truncate text-[10px] text-[#554336]">
                                    {event.subtitle}
                                  </span>
                                </button>
                              )}
                              {!event && dayIndex === 0 && hourIndex === 8 && (
                                <div className="grid h-full place-items-center rounded-lg bg-[#F0EDF1]/70 text-[10px] font-bold text-[#887364]">
                                  Franja libre
                                </div>
                              )}
                              {!event && day.muted && hourIndex === 5 && (
                                <div className="grid h-44 place-items-center text-center text-[10px] text-[#887364]">
                                  <span>
                                    Día sin visitas
                                    <br />
                                    programadas
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F6F2F7] p-4 text-[11px] text-[#554336]">
                <div className="flex flex-wrap items-center gap-3">
                  <strong>Leyenda:</strong>
                  <span>
                    <i className="mr-1 inline-block size-2 rounded-full bg-[#006E2D]" />
                    Visita presencial
                  </span>
                  <span>
                    <i className="mr-1 inline-block size-2 rounded-full bg-[#EAE7EB]" />
                    Visita virtual
                  </span>
                  <span>
                    <i className="mr-1 inline-block size-2 rounded-full bg-[#FACC15]" />
                    Por confirmar
                  </span>
                  <span>
                    <i className="mr-1 inline-block size-2 rounded bg-[#DCD9DD]" />
                    Franja disponible
                  </span>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 font-black text-[#8D4B00]"
                >
                  <Download size={14} /> Exportar iCal
                </button>
              </div>
            </section>
            <aside className="space-y-5 xl:col-span-4">
              <SelectedVisit event={selectedEvent} />
              <AvailabilityCard />
              <div className="rounded-3xl bg-[#F0EDF1] p-5">
                <div className="flex items-center gap-2">
                  <div className="grid size-9 place-items-center rounded-xl bg-[#FACC15]">
                    <ShieldCheck size={18} />
                  </div>
                  <h2 className="font-black">Acompañamiento Habitat</h2>
                </div>
                <p className="mt-3 text-xs leading-5 text-[#554336]">
                  Un asesor verificado puede recibir estudiantes en tu puerta y
                  guiarlos por la propiedad.
                </p>
                <button
                  type="button"
                  className="mt-4 w-full rounded-xl border border-[#FACC15] bg-white px-3 py-3 text-xs font-black"
                >
                  Solicitar asesor para visita
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
      {showAvailability && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#1B1B1E]/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#8D4B00]">
                  Nueva disponibilidad
                </p>
                <h2 className="mt-1 text-xl font-black">Añadir franja libre</h2>
              </div>
              <button
                type="button"
                aria-label="Cerrar"
                onClick={() => setShowAvailability(false)}
                className="grid size-10 place-items-center rounded-full bg-[#F0EDF1]"
              >
                <X size={17} />
              </button>
            </div>
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-bold">
                Día
                <select className="field">
                  <option>Sábado 19 de octubre</option>
                  <option>Lunes 21 de octubre</option>
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-2 text-sm font-bold">
                  Desde
                  <input className="field" type="time" defaultValue="09:00" />
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  Hasta
                  <input className="field" type="time" defaultValue="13:00" />
                </label>
              </div>
              <button
                type="button"
                onClick={() => setShowAvailability(false)}
                className="mt-2 rounded-xl bg-[#FACC15] px-4 py-3 text-sm font-black"
              >
                Guardar franja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SelectedVisit({ event }: { event: (typeof events)[number] }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-[#D9FBE0] px-3 py-1 text-[10px] font-black text-[#006E2D]">
          Comienza en 15 minutos
        </span>
        <span className="text-[10px] text-[#887364]">Cita #VIS-8492</span>
      </div>
      <div className="mt-5 flex items-start gap-3">
        <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#FACC15] text-lg font-black">
          DR
        </div>
        <div>
          <h2 className="text-lg font-black">Diego Rodríguez</h2>
          <p className="text-xs text-[#554336]">
            Estudiante UCSM · Medicina (5to ciclo)
          </p>
          <p className="mt-2 text-xs font-bold text-[#006E2D]">
            Carné universitario verificado
          </p>
        </div>
      </div>
      <div className="mt-5 rounded-2xl bg-[#F6F2F7] p-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#887364]">
            Alojamiento a visitar
          </span>
          <span className="rounded bg-[#006E2D] px-2 py-1 text-[10px] font-black text-white">
            Presencial
          </span>
        </div>
        <p className="mt-2 text-sm font-black">
          Habitación individual luminosa
        </p>
        <p className="mt-2 flex gap-1 text-xs text-[#554336]">
          <MapPin size={14} className="text-[#8D4B00]" /> Calle Cortaderas 214,
          Yanahuara
        </p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-[#EAE7EB] p-3">
          <span className="block text-[10px] text-[#887364]">Fecha</span>
          <strong className="text-xs">Hoy, Sáb 19 Oct</strong>
        </div>
        <div className="rounded-xl bg-[#EAE7EB] p-3">
          <span className="block text-[10px] text-[#887364]">Horario</span>
          <strong className="text-xs">11:30 - 12:00</strong>
        </div>
      </div>
      <div className="mt-3 rounded-2xl border border-[#FACC15] bg-[#FFF7CC] p-3">
        <p className="text-xs font-black">
          <MessageCircle className="mr-1 inline size-4 text-[#CA8A04]" />
          Mensaje del postulante
        </p>
        <p className="mt-2 text-xs italic leading-5">
          “Quisiera revisar la ventilación y si cabe mi escritorio para libros.”
        </p>
      </div>
      <a
        href="https://wa.me/51959123456"
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#006E2D] px-4 py-3 text-xs font-black text-white"
      >
        <MessageCircle size={16} /> Escribir por WhatsApp
      </a>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          className="rounded-xl bg-[#F0EDF1] px-3 py-2 text-xs font-bold"
        >
          <Phone className="mr-1 inline size-4" /> Llamar
        </button>
        <button
          type="button"
          className="rounded-xl bg-[#F0EDF1] px-3 py-2 text-xs font-bold"
        >
          <Edit3 className="mr-1 inline size-4" /> Reprogramar
        </button>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-[#EAE7EB] pt-4">
        <button type="button" className="text-xs font-bold text-[#BA1A1A]">
          Cancelar cita
        </button>
        <button
          type="button"
          className="rounded-xl bg-[#EAE7EB] px-3 py-2 text-xs font-black"
        >
          <CheckMark /> Marcar realizada
        </button>
      </div>
    </section>
  );
}

function AvailabilityCard() {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-xl bg-[#F0EDF1] text-[#8D4B00]">
            <Clock3 size={18} />
          </div>
          <h2 className="font-black">Horarios habituales</h2>
        </div>
        <button type="button" className="text-xs font-black text-[#8D4B00]">
          Editar
        </button>
      </div>
      <p className="mt-3 text-xs leading-5 text-[#554336]">
        Los estudiantes solo pueden reservar dentro de tus franjas habilitadas.
      </p>
      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-center justify-between rounded-xl bg-[#F6F2F7] p-3">
          <strong>Lunes a viernes</strong>
          <span>04:00 PM – 07:00 PM</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-[#F6F2F7] p-3">
          <strong>Sábados</strong>
          <span>09:00 AM – 01:00 PM</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-[#F6F2F7] p-3 opacity-60">
          <strong>Domingos</strong>
          <span className="text-[#BA1A1A]">No disponible</span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#EAE7EB] p-3">
        <div>
          <strong className="block text-xs">Anticipación mínima</strong>
          <span className="text-[11px] text-[#554336]">
            Avisar con al menos 2 horas
          </span>
        </div>
        <span className="grid size-6 place-items-center rounded-full bg-[#006E2D] text-white">
          <CheckMark />
        </span>
      </div>
    </section>
  );
}

function CheckMark() {
  return <span className="text-sm font-black">✓</span>;
}
