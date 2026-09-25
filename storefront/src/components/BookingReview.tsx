import { Separator } from "@/components/ui/separator"
import { ANY_PROFESSIONAL, type BookingStep, type ProfessionalChoice } from "@/context/BookingContext"
import { formatLongDate } from "@/lib/dates"
import { formatCents, formatDuration } from "@/lib/money"
import type { Service } from "@/types"

interface BookingReviewProps {
  service: Service
  professional: ProfessionalChoice | null
  date: string | null
  time: string | null
  // Com onEdit, cada linha ganha um "Alterar" que leva o cliente àquela etapa.
  onEdit?: (step: BookingStep) => void
}

function Row({
  label,
  value,
  step,
  onEdit,
}: {
  label: string
  value: string
  step: BookingStep
  onEdit: ((step: BookingStep) => void) | undefined
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <div className="flex min-w-0 flex-col">
        <span className="text-xs text-fg-muted">{label}</span>
        <span className="font-medium text-fg">{value}</span>
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="shrink-0 text-xs font-medium text-fg underline-offset-4 hover:underline"
        >
          Alterar
        </button>
      )}
    </div>
  )
}

export function BookingReview({ service, professional, date, time, onEdit }: BookingReviewProps) {
  const professionalLabel =
    professional === null
      ? "—"
      : professional === ANY_PROFESSIONAL
        ? "Qualquer profissional disponível"
        : professional.name

  return (
    <div className="flex flex-col gap-3 rounded-md border border-line-strong p-3.5">
      <Row
        label="Serviço"
        value={`${service.name} · ${formatDuration(service.durationMinutes)}`}
        step="service"
        onEdit={onEdit}
      />
      <Row label="Profissional" value={professionalLabel} step="professional" onEdit={onEdit} />
      <Row label="Dia" value={date ? formatLongDate(date) : "—"} step="datetime" onEdit={onEdit} />
      <Row label="Horário" value={time ?? "—"} step="datetime" onEdit={onEdit} />

      <Separator />

      <div className="flex items-center justify-between text-sm">
        <span className="text-fg-muted">Valor</span>
        <span className="font-semibold tabular-nums text-fg">{formatCents(service.price)}</span>
      </div>
    </div>
  )
}
