import type { ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface OptionCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected: boolean
  disabled?: boolean
}

// Card de opção compartilhado por serviço, profissional e horário: borda fina
// no estado normal, borda de 2px na cor do texto (não uma troca de cor) no
// estado selecionado — igual ao grafismo do mockup de referência.
export function OptionCard({ selected, disabled, className, children, ...props }: OptionCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      className={cn(
        "flex w-full items-center rounded-md border text-left transition-colors",
        selected ? "border-2 border-fg font-medium" : "border-line-strong text-fg-muted hover:bg-tint",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
