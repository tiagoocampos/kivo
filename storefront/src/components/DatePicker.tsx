import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StepLabel } from "@/components/StepLabel"
import { cn } from "@/lib/utils"
import {
  addDays,
  dayOfMonth,
  diffInDays,
  formatDayMonth,
  formatLongDate,
  formatWeekdayInitials,
  todayInTimezone,
} from "@/lib/dates"

interface DatePickerProps {
  timezone: string
  value: string | null
  onChange: (date: string) => void
}

const DAYS_PER_PAGE = 7

// Semana em janela de 7 dias a partir de hoje (no relógio da barbearia), com
// navegação pra frente. Não mostra dia passado: a primeira página começa hoje.
export function DatePicker({ timezone, value, onChange }: DatePickerProps) {
  const today = todayInTimezone(timezone)

  // Abre na página que contém o dia já escolhido (ex: cliente voltou a esta etapa).
  const [page, setPage] = useState(() =>
    value ? Math.max(0, Math.floor(diffInDays(today, value) / DAYS_PER_PAGE)) : 0
  )

  const pageStart = addDays(today, page * DAYS_PER_PAGE)
  const days = Array.from({ length: DAYS_PER_PAGE }, (_, index) => addDays(pageStart, index))

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <StepLabel step={3} className="mb-1">
            Data e hora
          </StepLabel>
          <p className="text-sm text-fg-muted">
            {formatDayMonth(days[0]!)} – {formatDayMonth(days[DAYS_PER_PAGE - 1]!)}
          </p>
        </div>

        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setPage((current) => Math.max(0, current - 1))}
            disabled={page === 0}
            aria-label="Semana anterior"
          >
            <ChevronLeft />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setPage((current) => current + 1)}
            aria-label="Próxima semana"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const selected = day === value

          return (
            <button
              key={day}
              type="button"
              onClick={() => onChange(day)}
              aria-pressed={selected}
              aria-label={formatLongDate(day)}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-md border px-1 py-2 transition-colors",
                selected ? "border-2 border-fg font-medium" : "border-line-strong text-fg-muted hover:bg-tint"
              )}
            >
              <span className={cn("text-[11px] capitalize", selected ? "opacity-90" : "text-fg-muted")}>
                {formatWeekdayInitials(day)}
              </span>
              <span className="text-base leading-none tabular-nums text-fg">{dayOfMonth(day)}</span>
              <span className={cn("text-[9px] leading-none", day === today ? "font-medium" : "invisible")}>Hoje</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
