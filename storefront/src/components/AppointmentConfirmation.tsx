import { CheckCircle2, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatLongDate, getZonedParts } from "@/lib/dates"
import { formatCents, formatDuration } from "@/lib/money"
import { getCancellationPolicyText } from "@/lib/bookingPolicy"
import type { Appointment, Tenant } from "@/types"

interface AppointmentConfirmationProps {
  appointment: Appointment
  tenant: Tenant
  isAuthenticated: boolean
  onNewBooking: () => void
  onOpenAppointments: () => void
}

export function AppointmentConfirmation({
  appointment,
  tenant,
  isAuthenticated,
  onNewBooking,
  onOpenAppointments,
}: AppointmentConfirmationProps) {
  // scheduledAt é um instante UTC; o cliente vê o relógio da barbearia.
  const { date, time } = getZonedParts(appointment.scheduledAt, tenant.timezone)

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 p-3">
      <div className="flex flex-col items-center gap-1.5 pt-4 text-center">
        <CheckCircle2 className="size-9 text-primary" />
        <h1 className="font-heading text-lg font-semibold text-foreground">Agendamento realizado!</h1>
        <p className="text-sm text-muted-foreground">{tenant.name} já recebeu o seu horário.</p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border p-3.5 text-sm">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Serviço</span>
          <span className="font-medium text-foreground">
            {appointment.service.name} · {formatDuration(appointment.service.durationMinutes)}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Profissional</span>
          <span className="font-medium text-foreground">{appointment.professional.name}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Quando</span>
          <span className="font-medium text-foreground first-letter:uppercase">
            {formatLongDate(date)} às {time}
          </span>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Valor</span>
          <span className="font-semibold text-foreground">{formatCents(appointment.price)}</span>
        </div>
      </div>

      <p className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
        {getCancellationPolicyText(isAuthenticated)}
      </p>

      {tenant.phone && (
        <Button asChild variant="secondary" size="lg" className="w-full">
          <a href={`tel:${tenant.phone}`}>
            <Phone /> Falar com a barbearia
          </a>
        </Button>
      )}

      {isAuthenticated && (
        <Button onClick={onOpenAppointments} variant="secondary" size="lg" className="w-full">
          Ver meus agendamentos
        </Button>
      )}

      <Button onClick={onNewBooking} variant="outline" size="lg" className="w-full">
        Fazer novo agendamento
      </Button>
    </div>
  )
}
