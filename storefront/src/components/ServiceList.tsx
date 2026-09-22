import { ServiceCard } from "@/components/ServiceCard"
import type { Service } from "@/types"

interface ServiceListProps {
  services: Service[]
  selectedId: string | null
  onSelect: (service: Service) => void
}

export function ServiceList({ services, selectedId, onSelect }: ServiceListProps) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="font-heading text-base font-semibold text-foreground">Escolha o serviço</h2>
        <p className="text-sm text-muted-foreground">O que você quer fazer hoje?</p>
      </div>

      {services.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Esta barbearia ainda não cadastrou serviços para agendamento online.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
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
