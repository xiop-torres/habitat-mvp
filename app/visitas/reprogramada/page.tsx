import { SuccessState } from '@/components/FlowState'

export default function VisitRescheduledPage() {
  return <SuccessState eyebrow="Reprogramación confirmada" title="Tu visita ha sido reprogramada" description="El nuevo horario quedó guardado y el propietario recibió la actualización. Te enviaremos un recordatorio antes de tu visita." primaryLabel="Ver mis visitas" primaryHref="/visitas" secondaryLabel="Explorar alojamientos" secondaryHref="/buscar" icon="calendar" />
}
