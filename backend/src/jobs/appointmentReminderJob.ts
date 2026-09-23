import cron from "node-cron";
import prismaClient from "../prisma/index.js";
import { getZonedParts } from "../utils/timezone.js";
import { notifyAppointmentCustomer } from "../services/push/notifyPush.js";

const REMINDER_WINDOW_MIN_MS = 55 * 60_000;
const REMINDER_WINDOW_MAX_MS = 65 * 60_000;

// Roda a cada ~10min dentro do próprio processo (sem worker separado nesta
// fase): busca agendamentos que faltam entre 55 e 65 minutos pra acontecer e
// ainda não receberam o lembrete, manda o push e marca `reminderSentAt` — a
// marca acontece mesmo se o push falhar (best-effort), pra nunca reprocessar
// o mesmo agendamento pra sempre.
async function runAppointmentReminderJob(now: Date = new Date()): Promise<void> {
    const windowStart = new Date(now.getTime() + REMINDER_WINDOW_MIN_MS);
    const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_MAX_MS);

    const appointments = await prismaClient.appointment.findMany({
        where: {
            status: { in: ["agendado", "confirmado"] },
            reminderSentAt: null,
            scheduledAt: { gte: windowStart, lte: windowEnd }
        },
        select: {
            id: true,
            scheduledAt: true,
            tenant: { select: { timezone: true } }
        }
    });

    for (const appointment of appointments) {
        const { time } = getZonedParts(appointment.scheduledAt, appointment.tenant.timezone);

        await notifyAppointmentCustomer(appointment.id, {
            title: "Lembrete de agendamento",
            body: `Lembrete: seu agendamento é daqui a 1h, às ${time}. Confirma que vai?`
        });

        await prismaClient.appointment.update({
            where: { id: appointment.id },
            data: { reminderSentAt: now }
        });
    }
}

// Chamado uma vez na subida do servidor (não em teste/import isolado).
export function startAppointmentReminderJob(): void {
    cron.schedule("*/10 * * * *", () => {
        runAppointmentReminderJob().catch((error) => {
            console.error("[appointmentReminderJob] falhou:", error);
        });
    });
}

export { runAppointmentReminderJob };
