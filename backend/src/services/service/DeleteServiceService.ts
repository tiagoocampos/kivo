import { ServiceHasAppointmentsError, ServiceNotFoundError } from "../../errors/service/ServiceErrors.js";
import prismaClient from "../../prisma/index.js";

interface DeleteServiceServiceProps {
    tenantId: string;
    serviceId: string;
}

class DeleteServiceService {
    async execute({ tenantId, serviceId }: DeleteServiceServiceProps) {

        const service = await prismaClient.service.findFirst({
            where: {
                id: serviceId,
                tenantId
            }
        });

        if (!service) {
            throw new ServiceNotFoundError();
        }

        const appointmentsCount = await prismaClient.appointment.count({
            where: {
                serviceId: service.id
            }
        });

        if (appointmentsCount > 0) {
            throw new ServiceHasAppointmentsError();
        }

        await prismaClient.service.delete({
            where: {
                id: service.id
            }
        });
    }
}

export { DeleteServiceService };
