import { Check } from "lucide-react"
import { BOOKING_STEPS, type BookingStep } from "@/context/BookingContext"
import { cn } from "@/lib/utils"

const STEP_LABELS: Record<BookingStep, string> = {
  service: "Serviço",
  professional: "Profissional",
  datetime: "Data e hora",
  confirm: "Confirmar",
}

interface BookingStepperProps {
  current: BookingStep
  isStepComplete: (step: BookingStep) => boolean
  onSelect: (step: BookingStep) => void
}

export function BookingStepper({ current, isStepComplete, onSelect }: BookingStepperProps) {
  const currentIndex = BOOKING_STEPS.indexOf(current)

  return (
    <ol className="flex items-start gap-1" aria-label="Etapas do agendamento">
      {BOOKING_STEPS.map((step, index) => {
        const isCurrent = step === current
        const done = index < currentIndex && isStepComplete(step)
        // Etapa anterior já respondida: dá pra voltar tocando nela.
        const clickable = !isCurrent && index < currentIndex

        const marker = (
          <>
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                isCurrent && "border-primary bg-primary text-primary-foreground",
                done && "border-primary bg-accent text-accent-foreground",
                !isCurrent && !done && "border-border text-muted-foreground"
              )}
            >
              {done ? <Check className="size-3.5" /> : index + 1}
            </span>
            <span
              className={cn(
                "text-[11px] leading-tight",
                isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"
              )}
            >
              {STEP_LABELS[step]}
            </span>
          </>
        )

        return (
          <li key={step} className="flex-1" aria-current={isCurrent ? "step" : undefined}>
            {clickable ? (
              <button type="button" onClick={() => onSelect(step)} className="flex w-full flex-col items-center gap-1">
                {marker}
              </button>
            ) : (
              <div className="flex flex-col items-center gap-1">{marker}</div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
