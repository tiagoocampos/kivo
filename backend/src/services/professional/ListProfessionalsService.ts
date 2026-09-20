import prismaClient from "../../prisma/index.js";

interface ListProfessionalsServiceProps {
    tenantId: string;
}

class ListProfessionalsService {
    async execute({ tenantId }: ListProfessionalsServiceProps) {

        const professionals = await prismaClient.professional.findMany({
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
                photoUrl: true,
                isActive: true,
                createdAt: true,
                workingHours: {
                    orderBy: [
                        { dayOfWeek: "asc" },
                        { startTime: "asc" }
                    ],
                    select: {
                        id: true,
                        dayOfWeek: true,
                        startTime: true,
                        endTime: true
                    }
                }
            }
        });

        return professionals;
    }
}

export { ListProfessionalsService };
