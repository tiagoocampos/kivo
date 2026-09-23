import prismaClient from "../../prisma/index.js";
import { sendPushToMany } from "../../utils/sendPushNotification.js";

interface PushPayload {
    title: string;
    body: string;
}

// Best-effort de ponta a ponta: nenhuma das duas funções abaixo pode lançar —
// quem chama nunca precisa de try/catch, nem arrisca reverter a ação
// principal (confirmar/cancelar/criar agendamento) por causa de push.

// Cliente final, por agendamento (funciona pra convidado, sem conta).
export async function notifyAppointmentCustomer(appointmentId: string, payload: PushPayload): Promise<void> {
    try {
        const subscriptions = await prismaClient.appointmentPushSubscription.findMany({
            where: { appointmentId }
        });

        if (subscriptions.length === 0) return;

        await sendPushToMany(
            subscriptions.map((subscription) => ({
                id: subscription.id,
                endpoint: subscription.endpoint,
                p256dhKey: subscription.p256dhKey,
                authKey: subscription.authKey
            })),
            payload,
            (id) => prismaClient.appointmentPushSubscription.delete({ where: { id } })
        );
    } catch {
        // silencioso, de propósito.
    }
}

// Dono/funcionário do painel, por tenant (todos os usuários com assinatura ativa).
export async function notifyTenantUsers(tenantId: string, payload: PushPayload): Promise<void> {
    try {
        const subscriptions = await prismaClient.userPushSubscription.findMany({
            where: { user: { tenantId } }
        });

        if (subscriptions.length === 0) return;

        await sendPushToMany(
            subscriptions.map((subscription) => ({
                id: subscription.id,
                endpoint: subscription.endpoint,
                p256dhKey: subscription.p256dhKey,
                authKey: subscription.authKey
            })),
            payload,
            (id) => prismaClient.userPushSubscription.delete({ where: { id } })
        );
    } catch {
        // silencioso, de propósito.
    }
}
