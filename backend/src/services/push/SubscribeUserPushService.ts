import prismaClient from "../../prisma/index.js";

interface SubscribeUserPushServiceProps {
    userId: string;
    endpoint: string;
    p256dh: string;
    auth: string;
}

// Push do painel: por usuário (dono/funcionário), não por tenant — cada
// dispositivo em que ele deu permissão gera/atualiza uma assinatura.
class SubscribeUserPushService {
    async execute({ userId, endpoint, p256dh, auth }: SubscribeUserPushServiceProps) {
        await prismaClient.userPushSubscription.upsert({
            where: { endpoint },
            update: { userId, p256dhKey: p256dh, authKey: auth },
            create: { userId, endpoint, p256dhKey: p256dh, authKey: auth }
        });
    }
}

export { SubscribeUserPushService };
