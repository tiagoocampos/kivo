import prismaClient from "../../prisma/index.js";

interface MarkAllNotificationsReadServiceProps {
    tenantId: string;
}

class MarkAllNotificationsReadService {
    async execute({ tenantId }: MarkAllNotificationsReadServiceProps) {
        await prismaClient.notification.updateMany({
            where: { tenantId, readAt: null },
            data: { readAt: new Date() }
        });
    }
}

export { MarkAllNotificationsReadService };
