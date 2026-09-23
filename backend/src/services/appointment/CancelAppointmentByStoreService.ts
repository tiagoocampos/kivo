import { AppointmentCannotBeCanceledError, AppointmentNotFoundError } from "../../errors/appointment/AppointmentErrors.js";
import prismaClient from "../../prisma/index.js";
import { canCancelFromStatus } from "../../utils/appointmentStatus.js";
import { notifyAppointmentCustomer } from "../push/notifyPush.js";
import { APPOINTMENT_SELECT } from "./appointmentSelect.js";

interface CancelAppointmentByStoreServiceProps {
    tenantId: string;
    appointmentId: string;
    // Diferente do cancelamento pelo cliente final (reason obrigatório): aqui é
    // opcional — a loja pode cancelar sem justificar pro sistema.
    reason?: string | undefined;
}

class CancelAppointmentByStoreService {
    async execute({ tenantId, appointmentId, reason }: CancelAppointmentByStoreServiceProps) {

        const appointment = await prismaClient.appointment.findFirst({
            where: {
                id: appointmentId,
                tenantId
            },
            select: {
                id: true,
                status: true
            }
        });

        if (!appointment) {
            throw new AppointmentNotFoundError();
        }

        if (!canCancelFromStatus(appointment.status)) {
            throw new AppointmentCannotBeCanceledError("Este agendamento não pode mais ser cancelado.");
        }

        const updated = await prismaClient.appointment.update({
            where: {
                id: appointment.id
            },
            data: {
                status: "cancelado",
                canceledBy: "store",
                cancelReason: reason ?? null
            },
            select: APPOINTMENT_SELECT
        });

        await notifyAppointmentCustomer(updated.id, {
            title: "Agendamento cancelado",
            body: reason
                ? `Seu agendamento foi cancelado pela barbearia. Motivo: ${reason}`
                : "Seu agendamento foi cancelado pela barbearia."
        });

        return updated;
    }
}

export { CancelAppointmentByStoreService };
