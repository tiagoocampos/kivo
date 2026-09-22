import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCents, formatDuration } from "@/lib/money"
import type { Service } from "@/types"

interface ServiceCardProps {
  service: Service
  selected: boolean
  onSelect: (service: Service) => void
}

export function ServiceCard({ service, selected, onSelect }: ServiceCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(service)}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-start justify-between gap-3 rounded-xl border p-3.5 text-left transition-colors",
        selected ? "border-primary bg-accent" : "border-border bg-card hover:bg-muted"
      )}
    >
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-sm font-semibold text-foreground">{service.name}</span>
        {service.description && (
          <span className="line-clamp-2 text-xs text-muted-foreground">{service.description}</span>
        )}
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3.5" strokeWidth={1.75} />
          {formatDuration(service.durationMinutes)}
        </span>
      </span>

      <span className="shrink-0 text-sm font-semibold text-foreground">{formatCents(service.price)}</span>
    </button>
  )
}
