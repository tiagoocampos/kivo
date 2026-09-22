import {
    AppointmentNotFoundError,
    InvalidAppointmentStatusTransitionError
} from "../../errors/appointment/AppointmentErrors.js";
import prismaClient from "../../prisma/index.js";
import { canTransitionTo } from "../../utils/appointmentStatus.js";
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

        return prismaClient.appointment.update({
            where: {
                id: appointment.id
            },
            data: {
                status
            },
            select: APPOINTMENT_SELECT
        });
    }
}

export { UpdateAppointmentStatusService };
