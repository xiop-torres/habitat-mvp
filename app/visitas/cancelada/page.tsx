import { SuccessState } from '@/components/FlowState'

export default function VisitCancelledPage() {
  return <SuccessState eyebrow="Visita cancelada" title="Tu visita ha sido cancelada" description="Liberamos el horario y notificamos al propietario. No se generó ningún costo y puedes volver a buscar un espacio cuando quieras." primaryLabel="Buscar alojamientos" primaryHref="/buscar" secondaryLabel="Ver mis visitas" secondaryHref="/visitas" />
}
