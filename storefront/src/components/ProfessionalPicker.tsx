import { Users } from "lucide-react"
import { TenantAvatar } from "@/components/TenantAvatar"
import { ANY_PROFESSIONAL, type ProfessionalChoice } from "@/context/BookingContext"
import { cn } from "@/lib/utils"
import type { Professional } from "@/types"

interface ProfessionalPickerProps {
  professionals: Professional[]
  selected: ProfessionalChoice | null
  onSelect: (professional: ProfessionalChoice) => void
}

function optionClass(selected: boolean) {
  return cn(
    "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
    selected ? "border-primary bg-accent" : "border-border bg-card hover:bg-muted"
  )
}

export function ProfessionalPicker({ professionals, selected, onSelect }: ProfessionalPickerProps) {
  const anySelected = selected === ANY_PROFESSIONAL

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="font-heading text-base font-semibold text-foreground">Escolha o profissional</h2>
        <p className="text-sm text-muted-foreground">Com quem você prefere ser atendido?</p>
      </div>

      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => onSelect(ANY_PROFESSIONAL)}
          aria-pressed={anySelected}
          className={optionClass(anySelected)}
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Users className="size-5" strokeWidth={1.75} />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="text-sm font-semibold text-foreground">Qualquer profissional disponível</span>
            <span className="text-xs text-muted-foreground">Mais horários à escolha</span>
          </span>
        </button>

        {professionals.map((professional) => {
          const isSelected = selected !== null && selected !== ANY_PROFESSIONAL && selected.id === professional.id

          return (
            <button
              key={professional.id}
              type="button"
              onClick={() => onSelect(professional)}
              aria-pressed={isSelected}
              className={optionClass(isSelected)}
            >
              <TenantAvatar logoUrl={professional.photoUrl} className="size-11" />
              <span className="truncate text-sm font-semibold text-foreground">{professional.name}</span>
            </button>
          )
        })}
      </div>

      {professionals.length === 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Nenhum profissional cadastrado no momento — não é possível agendar online.
        </p>
      )}
    </section>
  )
}
