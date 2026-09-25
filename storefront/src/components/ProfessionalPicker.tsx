import { Users } from "lucide-react"
import { OptionCard } from "@/components/OptionCard"
import { StepLabel } from "@/components/StepLabel"
import { TenantAvatar } from "@/components/TenantAvatar"
import { ANY_PROFESSIONAL, type ProfessionalChoice } from "@/context/BookingContext"
import { cn } from "@/lib/utils"
import type { Professional } from "@/types"

interface ProfessionalPickerProps {
  professionals: Professional[]
  selected: ProfessionalChoice | null
  onSelect: (professional: ProfessionalChoice) => void
}

export function ProfessionalPicker({ professionals, selected, onSelect }: ProfessionalPickerProps) {
  const anySelected = selected === ANY_PROFESSIONAL

  return (
    <section className="flex flex-col gap-3">
      <StepLabel step={2}>Profissional</StepLabel>

      <div className="flex flex-col gap-2">
        <OptionCard selected={anySelected} onClick={() => onSelect(ANY_PROFESSIONAL)} className="gap-3 p-3">
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-full",
              anySelected ? "bg-fg text-surface" : "border border-line-strong text-fg-muted"
            )}
          >
            <Users className="size-5" strokeWidth={1.75} />
          </span>
          <span className="flex min-w-0 flex-col text-left">
            <span className="text-sm text-fg">Qualquer profissional disponível</span>
            <span className="text-xs text-fg-muted">Mais horários à escolha</span>
          </span>
        </OptionCard>

        {professionals.map((professional) => {
          const isSelected = selected !== null && selected !== ANY_PROFESSIONAL && selected.id === professional.id

          return (
            <OptionCard
              key={professional.id}
              selected={isSelected}
              onClick={() => onSelect(professional)}
              className="gap-3 p-3"
            >
              <TenantAvatar logoUrl={professional.photoUrl} className="size-11" />
              <span className="truncate text-sm text-fg">{professional.name}</span>
            </OptionCard>
          )
        })}
      </div>

      {professionals.length === 0 && (
        <p className="text-center text-xs text-fg-muted">
          Nenhum profissional cadastrado no momento — não é possível agendar online.
        </p>
      )}
    </section>
  )
}
