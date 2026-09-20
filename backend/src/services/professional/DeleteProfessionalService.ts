import { ProfessionalHasAppointmentsError, ProfessionalNotFoundError } from "../../errors/professional/ProfessionalErrors.js";
import prismaClient from "../../prisma/index.js";

interface DeleteProfessionalServiceProps {
    tenantId: string;
    professionalId: string;
}

class DeleteProfessionalService {
    async execute({ tenantId, professionalId }: DeleteProfessionalServiceProps) {

        const professional = await prismaClient.professional.findFirst({
            where: {
                id: professionalId,
                tenantId
            }
        });

        if (!professional) {
            throw new ProfessionalNotFoundError();
        }

        // Quem já atendeu (ou tem agendamento futuro) fica no histórico e na
        // agenda — nesse caso o caminho é desativar, não excluir.
        const appointmentsCount = await prismaClient.appointment.count({
            where: {
                professionalId: professional.id
            }
        });

        if (appointmentsCount > 0) {
            throw new ProfessionalHasAppointmentsError();
        }

        await prismaClient.professional.delete({
            where: {
                id: professional.id
            }
        });
    }
}

export { DeleteProfessionalService };
