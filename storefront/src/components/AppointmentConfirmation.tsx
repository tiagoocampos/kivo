import { CheckCircle2, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { NotificationOptIn } from "@/components/NotificationOptIn"
import { formatLongDate, getZonedParts } from "@/lib/dates"
import { formatCents, formatDuration } from "@/lib/money"
import { getCancellationPolicyText } from "@/lib/bookingPolicy"
import type { Appointment, Tenant } from "@/types"

interface AppointmentConfirmationProps {
  appointment: Appointment
  tenant: Tenant
  slug: string
  isAuthenticated: boolean
  onNewBooking: () => void
  onOpenAppointments: () => void
}

export function AppointmentConfirmation({
  appointment,
  tenant,
  slug,
  isAuthenticated,
  onNewBooking,
  onOpenAppointments,
}: AppointmentConfirmationProps) {
  // scheduledAt é um instante UTC; o cliente vê o relógio da barbearia.
  const { date, time } = getZonedParts(appointment.scheduledAt, tenant.timezone)

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 p-3">
      <div
        data-tone="light"
        className="flex items-center gap-3 rounded-md border border-fg bg-surface px-4 py-3.5 text-fg shadow-[0_18px_40px_-20px_rgba(10,10,10,0.5)]"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-fg text-surface">
          <CheckCircle2 className="size-5" />
        </span>
        <div>
          <p className="text-sm leading-tight font-semibold">Agendamento confirmado</p>
          <p className="text-xs text-fg-muted">{tenant.name} já recebeu o seu horário.</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-line-strong p-3.5 text-sm">
        <div className="flex flex-col">
          <span className="text-xs text-fg-muted">Serviço</span>
          <span className="font-medium text-fg">
            {appointment.service.name} · {formatDuration(appointment.service.durationMinutes)}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-fg-muted">Profissional</span>
          <span className="font-medium text-fg">{appointment.professional.name}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-fg-muted">Quando</span>
          <span className="font-medium text-fg first-letter:uppercase tabular-nums">
            {formatLongDate(date)} às {time}
          </span>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="text-fg-muted">Valor</span>
          <span className="font-semibold tabular-nums text-fg">{formatCents(appointment.price)}</span>
        </div>
      </div>

      <p className="rounded-md bg-tint p-3 text-xs text-fg-muted">
        {getCancellationPolicyText(isAuthenticated)}
      </p>

      <NotificationOptIn slug={slug} appointmentId={appointment.id} />

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
