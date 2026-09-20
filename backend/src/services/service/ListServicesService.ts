import prismaClient from "../../prisma/index.js";

interface ListServicesServiceProps {
    tenantId: string;
}

class ListServicesService {
    async execute({ tenantId }: ListServicesServiceProps) {

        const services = await prismaClient.service.findMany({
            where: {
                tenantId
            },
            orderBy: {
                name: "asc"
            },
            select: {
                id: true,
                tenantId: true,
                name: true,
                description: true,
                durationMinutes: true,
                price: true,
                isActive: true,
                createdAt: true
            }
        });

        return services;
    }
}

export { ListServicesService };
