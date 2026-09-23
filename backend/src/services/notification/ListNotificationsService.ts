import prismaClient from "../../prisma/index.js";

interface ListNotificationsServiceProps {
    tenantId: string;
    cursor?: string | undefined;
    limit?: number | undefined;
}

const DEFAULT_LIMIT = 20;

class ListNotificationsService {
    async execute({ tenantId, cursor, limit = DEFAULT_LIMIT }: ListNotificationsServiceProps) {

        // createdAt sozinho não é uma chave estável (dois registros podem empatar
        // no mesmo instante) — id como critério de desempate garante que a
        // paginação por cursor não pule nem repita itens.
        const notifications = await prismaClient.notification.findMany({
            where: { tenantId },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            take: limit + 1,
            ...(cursor && {
                cursor: { id: cursor },
                skip: 1
            })
        });

        const hasMore = notifications.length > limit;
        const items = hasMore ? notifications.slice(0, limit) : notifications;

        return {
            items: items.map((notification) => ({
                id: notification.id,
                type: notification.type,
                title: notification.title,
                body: notification.body,
                appointmentId: notification.appointmentId,
                read: notification.readAt !== null,
                createdAt: notification.createdAt
            })),
            nextCursor: hasMore ? items[items.length - 1]!.id : null
        };
    }
}

export { ListNotificationsService };
