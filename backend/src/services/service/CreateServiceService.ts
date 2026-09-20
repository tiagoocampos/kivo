import prismaClient from "../../prisma/index.js";

interface CreateServiceServiceProps {
    tenantId: string;
    name: string;
    description?: string | undefined;
    durationMinutes: number;
    price: number;
}

class CreateServiceService {
    async execute({ tenantId, name, description, durationMinutes, price }: CreateServiceServiceProps) {

        const service = await prismaClient.service.create({
            data: {
                tenantId,
                name,
                description: description ?? null,
                durationMinutes,
                price
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

        return service;
    }
}

export { CreateServiceService };
