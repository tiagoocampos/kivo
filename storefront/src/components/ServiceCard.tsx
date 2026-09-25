import { Clock } from "lucide-react"
import { OptionCard } from "@/components/OptionCard"
import { formatCents, formatDuration } from "@/lib/money"
import type { Service } from "@/types"

interface ServiceCardProps {
  service: Service
  selected: boolean
  onSelect: (service: Service) => void
}

export function ServiceCard({ service, selected, onSelect }: ServiceCardProps) {
  return (
    <OptionCard selected={selected} onClick={() => onSelect(service)} className="items-start justify-between gap-3 p-3.5">
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-sm text-fg">{service.name}</span>
        {service.description && <span className="line-clamp-2 text-xs text-fg-muted">{service.description}</span>}
        <span className="flex items-center gap-1 text-xs text-fg-muted">
          <Clock className="size-3.5" strokeWidth={1.75} />
          {formatDuration(service.durationMinutes)}
        </span>
      </span>

      <span className="shrink-0 text-sm tabular-nums text-fg">{formatCents(service.price)}</span>
    </OptionCard>
  )
}
