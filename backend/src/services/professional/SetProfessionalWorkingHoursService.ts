import { ProfessionalNotFoundError } from "../../errors/professional/ProfessionalErrors.js";
import prismaClient from "../../prisma/index.js";

interface WorkingInterval {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

interface SetProfessionalWorkingHoursServiceProps {
    tenantId: string;
    professionalId: string;
    intervals: WorkingInterval[];
}

// Substitui a semana inteira do profissional de uma vez. O painel edita a
// semana como um todo, então "apagar tudo e recriar" numa transação é mais
// simples e seguro do que diffar intervalo por intervalo.
class SetProfessionalWorkingHoursService {
    async execute({ tenantId, professionalId, intervals }: SetProfessionalWorkingHoursServiceProps) {

        const professional = await prismaClient.professional.findFirst({
            where: {
                id: professionalId,
                tenantId
            },
            select: {
                id: true
            }
        });

        if (!professional) {
            throw new ProfessionalNotFoundError();
        }

        return prismaClient.$transaction(async (tx) => {
            await tx.workingHours.deleteMany({
                where: {
                    professionalId: professional.id
                }
            });

            await tx.workingHours.createMany({
                data: intervals.map((interval) => ({
                    professionalId: professional.id,
                    dayOfWeek: interval.dayOfWeek,
                    startTime: interval.startTime,
                    endTime: interval.endTime
                }))
            });

            return tx.workingHours.findMany({
                where: {
                    professionalId: professional.id
                },
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
            });
        });
    }
}

export { SetProfessionalWorkingHoursService };
