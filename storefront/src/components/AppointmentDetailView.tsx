import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { formatLongDate, getZonedParts } from "@/lib/dates"
import { formatCents, formatDuration } from "@/lib/money"
import {
  canCustomerCancel,
  getAppointmentStatusClass,
  getAppointmentStatusLabel,
  getCanceledByLabel,
} from "@/lib/appointmentStatus"
import { cancelCustomerAppointment } from "@/services/customer"
import type { Appointment } from "@/types"

interface AppointmentDetailViewProps {
  appointment: Appointment
  slug: string
  timezone: string
  onAppointmentUpdated: (appointment: Appointment) => void
}

export function AppointmentDetailView({ appointment, slug, timezone, onAppointmentUpdated }: AppointmentDetailViewProps) {
  const [showCancelForm, setShowCancelForm] = useState(false)
  const [reason, setReason] = useState("")
  const [isCanceling, setIsCanceling] = useState(false)

  const { date, time } = getZonedParts(appointment.scheduledAt, timezone)

  const handleCancel = async () => {
    if (!reason.trim()) return

    setIsCanceling(true)
    try {
      const updated = await cancelCustomerAppointment(slug, appointment.id, reason.trim())
      onAppointmentUpdated({ ...appointment, ...updated })
      toast.success("Agendamento cancelado")
      setShowCancelForm(false)
      setReason("")
    } catch {
      // erro já tratado e exibido via toast no interceptor do axios
    } finally {
      setIsCanceling(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground first-letter:uppercase">
          {formatLongDate(date)} às {time}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getAppointmentStatusClass(appointment.status)}`}>
          {getAppointmentStatusLabel(appointment.status)}
        </span>
      </div>

      <Separator />

      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Serviço</span>
          <span className="text-right text-foreground">
            {appointment.service.name} · {formatDuration(appointment.service.durationMinutes)}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Profissional</span>
          <span className="text-right text-foreground">{appointment.professional.name}</span>
        </div>
        <div className="flex justify-between gap-3 font-semibold">
          <span className="text-foreground">Valor</span>
          <span className="text-foreground">{formatCents(appointment.price)}</span>
        </div>
      </div>

      {appointment.status === "cancelado" && appointment.canceledBy && (
        <div className="flex flex-col gap-1 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm">
          <span className="font-medium text-destructive">
            Cancelado por {getCanceledByLabel(appointment.canceledBy)}
          </span>
          {appointment.cancelReason && (
            <span className="text-muted-foreground">Motivo: {appointment.cancelReason}</span>
          )}
        </div>
      )}

      {canCustomerCancel(appointment) &&
        (showCancelForm ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="cancelReason">Motivo do cancelamento</Label>
            <Textarea
              id="cancelReason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Conte pra barbearia por que está cancelando"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={isCanceling}
                onClick={() => {
                  setShowCancelForm(false)
                  setReason("")
                }}
              >
                Voltar
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={isCanceling || !reason.trim()}
                onClick={handleCancel}
              >
                {isCanceling ? "Cancelando..." : "Confirmar cancelamento"}
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" className="w-full text-destructive" onClick={() => setShowCancelForm(true)}>
            Cancelar agendamento
          </Button>
        ))}
    </div>
  )
}
