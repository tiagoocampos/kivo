import { ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { BookingStep } from "@/context/BookingContext"
import { formatShortDate } from "@/lib/dates"
import { formatCents } from "@/lib/money"
import type { Service } from "@/types"

interface BookingSummaryBarProps {
  step: BookingStep
  service: Service | null
  date: string | null
  time: string | null
  canContinue: boolean
  isSubmitting: boolean
  onContinue: () => void
  onOpenSummary: () => void
}

// "Corte de cabelo · Sex, 26/09 · 14:30" — só as partes já escolhidas.
function buildSummary(service: Service, date: string | null, time: string | null): string {
  return [service.name, date ? formatShortDate(date) : null, time].filter(Boolean).join(" · ")
}

export function BookingSummaryBar({
  step,
  service,
  date,
  time,
  canContinue,
  isSubmitting,
  onContinue,
  onOpenSummary,
}: BookingSummaryBarProps) {
  // Sem serviço escolhido não há o que resumir.
  if (!service) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-line bg-surface px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgba(10,10,10,0.25)]">
      <button
        type="button"
        onClick={onOpenSummary}
        aria-label="Ver resumo do agendamento"
        className="flex min-w-0 flex-1 flex-col items-start text-left"
      >
        <span className="flex w-full items-center gap-1 text-sm font-semibold text-fg">
          {/* Quebra em até 2 linhas em vez de cortar: o dia/horário é o que o cliente mais precisa conferir. */}
          <span className="line-clamp-2">{buildSummary(service, date, time)}</span>
          <ChevronUp className="size-4 shrink-0 text-fg-muted" />
        </span>
        <span className="text-xs tabular-nums text-fg-muted">{formatCents(service.price)}</span>
      </button>

      {step === "confirm" ? (
        // O formulário de confirmação mora na página; o botão daqui o envia pelo id.
        // As `key`s diferentes são essenciais: sem elas o React reaproveita o MESMO <button>
        // do "Continuar" e troca só o type — e o clique que avançou de etapa vira submit
        // no mesmo instante, criando o agendamento sem o cliente ter confirmado.
        <Button
          key="confirm"
          type="submit"
          form="booking-confirm-form"
          size="lg"
          disabled={isSubmitting}
          className="rounded-md bg-fg text-surface hover:bg-fg/90"
        >
          {isSubmitting ? "Agendando..." : "Confirmar agendamento"}
        </Button>
      ) : (
        <Button
          key="continue"
          type="button"
          size="lg"
          onClick={onContinue}
          disabled={!canContinue}
          className="rounded-md bg-fg text-surface hover:bg-fg/90"
        >
          Continuar
        </Button>
      )}
    </div>
  )
}
