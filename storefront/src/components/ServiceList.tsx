import { ServiceCard } from "@/components/ServiceCard"
import { StepLabel } from "@/components/StepLabel"
import type { Service } from "@/types"

interface ServiceListProps {
  services: Service[]
  selectedId: string | null
  onSelect: (service: Service) => void
}

export function ServiceList({ services, selectedId, onSelect }: ServiceListProps) {
  return (
    <section className="flex flex-col gap-3">
      <StepLabel step={1}>Serviço</StepLabel>

      {services.length === 0 ? (
        <p className="rounded-md border border-dashed border-line-strong p-6 text-center text-sm text-fg-muted">
          Esta barbearia ainda não cadastrou serviços para agendamento online.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              selected={service.id === selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </section>
  )
}
