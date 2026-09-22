import type { Prisma } from "../../generated/prisma/client.js";
import { computeAvailableSlots, SLOT_GRANULARITY_MINUTES } from "../../utils/availability.js";
import { getDayRangeInTimezone, todayInTimezone, weekdayOf } from "../../utils/dateRange.js";
import { getZonedParts } from "../../utils/timezone.js";

// Aceita o prisma "normal" ou o cliente de dentro de uma transação — o
// CreateAppointmentService roda esta MESMA lógica dentro da transação que grava o agendamento.
type Db = Prisma.TransactionClient;

interface ComputeProfessionalSlotsProps {
    professionalId: string;
    serviceDurationMinutes: number;
    date: string; // "YYYY-MM-DD" no fuso da barbearia
    timezone: string;
    now: Date;
}

// Minutos desde a meia-noite local de `date`. Um agendamento que começou no dia
// anterior (ou termina no seguinte) é limitado às bordas do dia consultado.
function toMinutesOfDay(instant: Date, date: string, timezone: string): number {
    const parts = getZonedParts(instant, timezone);

    if (parts.date < date) return 0;
    if (parts.date > date) return 24 * 60;

    return parts.minutes;
}

// Horários livres de UM profissional num dia: busca expediente e agendamentos no
// banco, converte pro relógio local da barbearia e delega o cálculo à função pura.
async function computeProfessionalSlots(
    db: Db,
    { professionalId, serviceDurationMinutes, date, timezone, now }: ComputeProfessionalSlotsProps
): Promise<string[]> {
    const today = todayInTimezone(timezone, now);

    // Dia que já passou nunca tem horário.
    if (date < today) return [];

    const workingHours = await db.workingHours.findMany({
        where: {
            professionalId,
            dayOfWeek: weekdayOf(date)
        },
        select: {
            startTime: true,
            endTime: true
        }
    });

    if (workingHours.length === 0) return [];

    const { start, end } = getDayRangeInTimezone(date, timezone);

    // Qualquer agendamento não cancelado que encoste no dia, mesmo que comece
    // antes da meia-noite ou termine depois.
    const appointments = await db.appointment.findMany({
        where: {
            professionalId,
            status: { not: "cancelado" },
            scheduledAt: { lt: end },
            endsAt: { gt: start }
        },
        select: {
            scheduledAt: true,
            endsAt: true
        }
    });

    return computeAvailableSlots({
        workingHours,
        existingAppointments: appointments.map((appointment) => ({
            startMinutes: toMinutesOfDay(appointment.scheduledAt, date, timezone),
            endMinutes: toMinutesOfDay(appointment.endsAt, date, timezone)
        })),
        serviceDurationMinutes,
        slotGranularityMinutes: SLOT_GRANULARITY_MINUTES,
        nowMinutes: date === today ? getZonedParts(now, timezone).minutes : null
    });
}

export { computeProfessionalSlots };
