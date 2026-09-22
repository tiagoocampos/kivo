import { useEffect, useMemo, useState } from "react"
import { CalendarX } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { AppointmentDetailView } from "@/components/AppointmentDetailView"
import { formatAppointmentDateTime } from "@/lib/dates"
import { formatCents } from "@/lib/money"
import { getAppointmentStatusClass, getAppointmentStatusLabel, isUpcomingStatus } from "@/lib/appointmentStatus"
import { listCustomerAppointments } from "@/services/customer"
import type { Appointment } from "@/types"

interface AppointmentsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slug: string
  timezone: string
}

function AppointmentRow({
  appointment,
  timezone,
  onClick,
}: {
  appointment: Appointment
  timezone: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col gap-2 rounded-xl border border-border p-3 text-left transition-colors hover:bg-muted"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">
          {formatAppointmentDateTime(appointment.scheduledAt, timezone)}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getAppointmentStatusClass(appointment.status)}`}>
          {getAppointmentStatusLabel(appointment.status)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="truncate">
          {appointment.service.name} · {appointment.professional.name}
        </span>
        <span className="shrink-0 font-semibold text-foreground">{formatCents(appointment.price)}</span>
      </div>
    </button>
  )
}

export function AppointmentsSheet({ open, onOpenChange, slug, timezone }: AppointmentsSheetProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Appointment | null>(null)

  useEffect(() => {
    if (!open) return

    let active = true
    setLoading(true)
    listCustomerAppointments(slug)
      .then((data) => {
        if (active) setAppointments(data)
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [open, slug])

  // Próximos (do mais perto ao mais longe) primeiro; o resto vira histórico (do mais recente ao mais antigo).
  const { upcoming, history } = useMemo(() => {
    const byDate = (a: Appointment, b: Appointment) => a.scheduledAt.localeCompare(b.scheduledAt)

    return {
      upcoming: appointments.filter((item) => isUpcomingStatus(item.status)).sort(byDate),
      history: appointments.filter((item) => !isUpcomingStatus(item.status)).sort((a, b) => byDate(b, a)),
    }
  }, [appointments])

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) setSelected(null)
    onOpenChange(nextOpen)
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="flex w-full flex-col overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{selected ? "Detalhe do agendamento" : "Meus agendamentos"}</SheetTitle>
          <SheetDescription className="sr-only">Seus agendamentos nesta barbearia</SheetDescription>
        </SheetHeader>

        {selected ? (
          <div className="flex flex-col gap-4 px-4 pb-4">
            <AppointmentDetailView
              appointment={selected}
              slug={slug}
              timezone={timezone}
              onAppointmentUpdated={(updated) => {
                setAppointments((current) => current.map((item) => (item.id === updated.id ? updated : item)))
                setSelected(updated)
              }}
            />
            <Button variant="ghost" onClick={() => setSelected(null)}>
              Voltar para meus agendamentos
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 px-4 pb-4">
            {loading &&
              Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-20 w-full rounded-xl" />)}

            {!loading && appointments.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
                <CalendarX className="size-8" />
                <p className="text-sm">Você ainda não tem agendamentos nesta barbearia.</p>
              </div>
            )}

            {!loading && upcoming.length > 0 && (
              <>
                <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Próximos</h3>
                {upcoming.map((item) => (
                  <AppointmentRow key={item.id} appointment={item} timezone={timezone} onClick={() => setSelected(item)} />
                ))}
              </>
            )}

            {!loading && history.length > 0 && (
              <>
                <h3 className="mt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Histórico</h3>
                {history.map((item) => (
                  <AppointmentRow key={item.id} appointment={item} timezone={timezone} onClick={() => setSelected(item)} />
                ))}
              </>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
