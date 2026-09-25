import { CalendarX, Phone, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatShortDate } from "@/lib/dates"
import type { AvailabilityState } from "@/hooks/useAvailability"

interface TimeSlotPickerProps {
  date: string | null
  state: AvailabilityState
  selectedTime: string | null
  contactPhone: string | null
  onSelect: (time: string) => void
  onRetry: () => void
}

const PERIODS = [
  { label: "Manhã", matches: (time: string) => time < "12:00" },
  { label: "Tarde", matches: (time: string) => time >= "12:00" && time < "18:00" },
  { label: "Noite", matches: (time: string) => time >= "18:00" },
]

function Notice({ icon, title, children }: { icon: React.ReactNode; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-line-strong p-6 text-center">
      <span className="text-fg-muted">{icon}</span>
      <p className="text-sm font-medium text-fg">{title}</p>
      {children}
    </div>
  )
}

export function TimeSlotPicker({ date, state, selectedTime, contactPhone, onSelect, onRetry }: TimeSlotPickerProps) {
  const content = (() => {
    if (!date || state.status === "idle") {
      return <p className="text-sm text-fg-muted">Escolha um dia para ver os horários livres.</p>
    }

    if (state.status === "loading") {
      return (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-busy="true" aria-label="Carregando horários">
          {Array.from({ length: 9 }).map((_, index) => (
            <Skeleton key={index} className="h-10 rounded-md" />
          ))}
        </div>
      )
    }

    // O motor de disponibilidade ainda não existe no backend (404/501).
    if (state.status === "unavailable") {
      return (
        <Notice icon={<CalendarX className="size-6" />} title="Horários ainda não disponíveis para agendamento online">
          <p className="text-xs text-fg-muted">Fale com a barbearia para marcar o seu horário.</p>
          {contactPhone && (
            <Button asChild variant="outline" size="sm">
              <a href={`tel:${contactPhone}`}>
                <Phone /> {contactPhone}
              </a>
            </Button>
          )}
        </Notice>
      )
    }

    if (state.status === "error") {
      return (
        <Notice icon={<RefreshCw className="size-6" />} title="Não foi possível carregar os horários">
          <p className="text-xs text-fg-muted">Verifique sua conexão e tente de novo.</p>
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw /> Tentar novamente
          </Button>
        </Notice>
      )
    }

    if (state.slots.length === 0) {
      return (
        <Notice icon={<CalendarX className="size-6" />} title="Sem horários livres neste dia">
          <p className="text-xs text-fg-muted">Tente outro dia ou outro profissional.</p>
        </Notice>
      )
    }

    return (
      <div className="flex flex-col gap-4">
        {PERIODS.map((period) => {
          const slots = state.slots.filter(period.matches)
          if (slots.length === 0) return null

          return (
            <div key={period.label} className="flex flex-col gap-2">
              <h3 className="text-xs font-medium uppercase tracking-wide text-fg-muted">{period.label}</h3>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((slot) => {
                  const selected = slot === selectedTime

                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => onSelect(slot)}
                      aria-pressed={selected}
                      className={cn(
                        "rounded-md border py-2.5 text-sm tabular-nums transition-colors",
                        selected
                          ? "border-fg bg-fg font-semibold text-surface"
                          : "border-line-strong text-fg hover:bg-tint"
                      )}
                    >
                      {slot}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  })()

  return (
    <section className="flex flex-col gap-3">
      {date && <p className="text-sm text-fg-muted">{formatShortDate(date)}</p>}
      {content}
    </section>
  )
}
