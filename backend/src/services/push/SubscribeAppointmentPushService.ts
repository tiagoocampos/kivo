import { AppointmentNotFoundError } from "../../errors/appointment/AppointmentErrors.js";
import prismaClient from "../../prisma/index.js";
import { resolveTenantOrThrow } from "../tenant/resolveTenantOrThrow.js";

interface SubscribeAppointmentPushServiceProps {
    slug: string;
    appointmentId: string;
    endpoint: string;
    p256dh: string;
    auth: string;
}

// Push do cliente final: por agendamento, não por conta — funciona pra
// convidado, sem precisar de login (mesmo princípio do OrderPushSubscription
// do Alô Delivery). Pública, então valida que o agendamento é desta barbearia
// antes de gravar qualquer coisa.
class SubscribeAppointmentPushService {
    async execute({ slug, appointmentId, endpoint, p256dh, auth }: SubscribeAppointmentPushServiceProps) {
        const tenant = await resolveTenantOrThrow({ slug });

        const appointment = await prismaClient.appointment.findFirst({
            where: { id: appointmentId, tenantId: tenant.id },
            select: { id: true }
        });

        if (!appointment) {
            throw new AppointmentNotFoundError();
        }

        await prismaClient.appointmentPushSubscription.upsert({
            where: { endpoint },
            update: { appointmentId: appointment.id, p256dhKey: p256dh, authKey: auth },
            create: { appointmentId: appointment.id, endpoint, p256dhKey: p256dh, authKey: auth }
        });
    }
}

export { SubscribeAppointmentPushService };
