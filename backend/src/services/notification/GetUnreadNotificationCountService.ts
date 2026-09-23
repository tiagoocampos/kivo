import prismaClient from "../../prisma/index.js";

interface GetUnreadNotificationCountServiceProps {
    tenantId: string;
}

class GetUnreadNotificationCountService {
    async execute({ tenantId }: GetUnreadNotificationCountServiceProps) {
        const count = await prismaClient.notification.count({
            where: { tenantId, readAt: null }
        });

        return { count };
    }
}

export { GetUnreadNotificationCountService };
