import { cn } from "@/lib/utils"

interface StepLabelProps {
  /** Número da etapa no fluxo (1, 2, 3...), exibido como "N · Rótulo". */
  step: number
  children: string
  className?: string
}

// Rótulo "N · Serviço" uppercase/tracked — mesmo grafismo em todo lugar que
// tem um fluxo em etapas (agendamento, confirmação), pra não repetir a mesma
// className espalhada pelos componentes.
export function StepLabel({ step, children, className }: StepLabelProps) {
  return (
    <p className={cn("mb-2.5 text-[0.6875rem] font-medium tracking-[0.16em] text-fg-muted uppercase", className)}>
      {step} · {children}
    </p>
  )
}
