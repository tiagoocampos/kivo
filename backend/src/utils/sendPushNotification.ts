import webpush from "../config/webPush.js";

interface PushSubscriptionLike {
    id: string;
    endpoint: string;
    p256dhKey: string;
    authKey: string;
}

interface PushPayload {
    title: string;
    body: string;
}

// Nunca lança: push é sempre best-effort, nunca pode derrubar a ação principal
// (confirmar/cancelar agendamento, criar agendamento...). 404/410 = endpoint
// morto (navegador desinstalado, permissão revogada) — quem chama apaga a
// assinatura pra não tentar de novo pra sempre.
async function sendToOne(subscription: PushSubscriptionLike, payload: PushPayload): Promise<{ shouldDelete: boolean }> {
    try {
        await webpush.sendNotification(
            {
                endpoint: subscription.endpoint,
                keys: { p256dh: subscription.p256dhKey, auth: subscription.authKey }
            },
            JSON.stringify(payload)
        );
        return { shouldDelete: false };
    } catch (error) {
        const statusCode = (error as { statusCode?: number } | undefined)?.statusCode;
        return { shouldDelete: statusCode === 404 || statusCode === 410 };
    }
}

// Manda pra várias assinaturas em paralelo e apaga as que morreram. `deleteById`
// é passado por quem chama porque UserPushSubscription e
// AppointmentPushSubscription são tabelas diferentes.
export async function sendPushToMany(
    subscriptions: PushSubscriptionLike[],
    payload: PushPayload,
    deleteById: (id: string) => Promise<unknown>
): Promise<void> {
    await Promise.all(
        subscriptions.map(async (subscription) => {
            const { shouldDelete } = await sendToOne(subscription, payload);
            if (shouldDelete) {
                await deleteById(subscription.id).catch(() => {});
            }
        })
    );
}
