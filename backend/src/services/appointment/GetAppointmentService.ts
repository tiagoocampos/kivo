import { AppointmentNotFoundError } from "../../errors/appointment/AppointmentErrors.js";
import prismaClient from "../../prisma/index.js";
import { APPOINTMENT_SELECT } from "./appointmentSelect.js";

interface GetAppointmentServiceProps {
    tenantId: string;
    appointmentId: string;
}

// Busca de um agendamento específico — usado pelo painel pra abrir o
// AppointmentDetailSheet a partir de um item do feed de notificações, que só
// carrega o appointmentId (não os dados completos do agendamento).
class GetAppointmentService {
    async execute({ tenantId, appointmentId }: GetAppointmentServiceProps) {
        const appointment = await prismaClient.appointment.findFirst({
            where: { id: appointmentId, tenantId },
            select: APPOINTMENT_SELECT
        });

        if (!appointment) {
            throw new AppointmentNotFoundError();
        }

        return appointment;
    }
}

export { GetAppointmentService };
