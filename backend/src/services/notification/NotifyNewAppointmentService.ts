import prismaClient from "../../prisma/index.js";
import { notifyTenantUsers } from "../push/notifyPush.js";

interface NotifyNewAppointmentServiceProps {
    tenantId: string;
    appointmentId: string;
    customerName: string;
    serviceName: string;
    time: string; // "HH:mm", já no fuso do tenant
}

// Um novo agendamento dispara duas coisas, mas com garantias bem diferentes:
// o registro que alimenta o sino do painel é persistido de forma síncrona —
// se isso falhar, é um erro real, não deve ser engolido — enquanto o push do
// sistema operacional continua best-effort (nunca deve derrubar a criação do
// agendamento, que já aconteceu).
class NotifyNewAppointmentService {
    async execute({ tenantId, appointmentId, customerName, serviceName, time }: NotifyNewAppointmentServiceProps) {
        const title = "Novo agendamento";
        const body = `${customerName} reservou ${serviceName} às ${time}`;

        await prismaClient.notification.create({
            data: {
                tenantId,
                appointmentId,
                type: "novo_agendamento",
                title,
                body
            }
        });

        void notifyTenantUsers(tenantId, { title, body });
    }
}

export { NotifyNewAppointmentService };
