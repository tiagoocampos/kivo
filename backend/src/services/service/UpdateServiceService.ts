import { ServiceNotFoundError } from "../../errors/service/ServiceErrors.js";
import prismaClient from "../../prisma/index.js";

interface UpdateServiceServiceProps {
    tenantId: string;
    serviceId: string;
    name?: string | undefined;
    description?: string | null | undefined;
    durationMinutes?: number | undefined;
    price?: number | undefined;
    isActive?: boolean | undefined;
}

class UpdateServiceService {
    async execute({ tenantId, serviceId, name, description, durationMinutes, price, isActive }: UpdateServiceServiceProps) {

        const service = await prismaClient.service.findFirst({
            where: {
                id: serviceId,
                tenantId
            }
        });

        if (!service) {
            throw new ServiceNotFoundError();
        }

        // Mudar preço/duração não mexe em agendamentos já feitos: o Appointment
        // congela price e endsAt no momento da marcação.
        const updated = await prismaClient.service.update({
            where: {
                id: service.id
            },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(durationMinutes !== undefined && { durationMinutes }),
                ...(price !== undefined && { price }),
                ...(isActive !== undefined && { isActive })
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

        return updated;
    }
}

export { UpdateServiceService };
