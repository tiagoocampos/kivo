import type { Appointment, AppointmentStatus, CanceledBy } from "@/types"

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  agendado: "Agendado",
  confirmado: "Confirmado",
  concluido: "Concluído",
  cancelado: "Cancelado",
  nao_compareceu: "Não compareceu",
}

// Cor da etiqueta de status: usa só tokens/paleta neutra + semântica (verde,
// vermelho, âmbar), pra continuar legível seja qual for a cor da barbearia.
const STATUS_CLASSES: Record<AppointmentStatus, string> = {
  agendado: "bg-accent text-accent-foreground",
  confirmado: "bg-emerald-600/15 text-emerald-700 dark:text-emerald-400",
  concluido: "bg-muted text-muted-foreground",
  cancelado: "bg-destructive/10 text-destructive",
  nao_compareceu: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
}

const CANCELED_BY_LABELS: Record<CanceledBy, string> = {
  customer: "você",
  store: "a barbearia",
}

export function getAppointmentStatusLabel(status: AppointmentStatus): string {
  return STATUS_LABELS[status] ?? status
}

export function getAppointmentStatusClass(status: AppointmentStatus): string {
  return STATUS_CLASSES[status] ?? STATUS_CLASSES.concluido
}

export function getCanceledByLabel(canceledBy: CanceledBy): string {
  return CANCELED_BY_LABELS[canceledBy] ?? canceledBy
}

// Regra do backend: o cliente só cancela enquanto o status ainda é "agendado".
export function canCustomerCancel(appointment: Pick<Appointment, "status">): boolean {
  return appointment.status === "agendado"
}

// "Próximos" = ainda vão acontecer (agendado/confirmado); o resto é histórico.
export function isUpcomingStatus(status: AppointmentStatus): boolean {
  return status === "agendado" || status === "confirmado"
}
