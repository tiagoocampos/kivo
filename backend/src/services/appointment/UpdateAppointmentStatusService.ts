import {
    AppointmentNotFoundError,
    InvalidAppointmentStatusTransitionError
} from "../../errors/appointment/AppointmentErrors.js";
import prismaClient from "../../prisma/index.js";
import { canTransitionTo } from "../../utils/appointmentStatus.js";
import { getZonedParts } from "../../utils/timezone.js";
import { notifyAppointmentCustomer } from "../push/notifyPush.js";
import { APPOINTMENT_SELECT } from "./appointmentSelect.js";
import type { AppointmentStatus } from "../../generated/prisma/enums.js";

interface UpdateAppointmentStatusServiceProps {
    tenantId: string;
    appointmentId: string;
    status: AppointmentStatus;
}

class UpdateAppointmentStatusService {
    async execute({ tenantId, appointmentId, status }: UpdateAppointmentStatusServiceProps) {

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

        if (!canTransitionTo(appointment.status, status)) {
            throw new InvalidAppointmentStatusTransitionError(appointment.status, status);
        }

        const updated = await prismaClient.appointment.update({
            where: {
                id: appointment.id
            },
            data: {
                status
            },
            select: APPOINTMENT_SELECT
        });

        // Push best-effort: nunca pode derrubar a resposta da mudança de status
        // que já aconteceu de verdade no banco.
        if (status === "confirmado") {
            try {
                const tenant = await prismaClient.tenant.findUnique({
                    where: { id: tenantId },
                    select: { timezone: true }
                });

                if (tenant) {
                    const { time } = getZonedParts(updated.scheduledAt, tenant.timezone);

                    await notifyAppointmentCustomer(updated.id, {
                        title: "Agendamento confirmado",
                        body: `Seu agendamento foi confirmado! ${updated.service.name} às ${time} com ${updated.professional.name}.`
                    });
                }
            } catch {
                // silencioso, de propósito.
            }
        }

        return updated;
    }
}

export { UpdateAppointmentStatusService };
