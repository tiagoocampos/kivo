import { ProfessionalNotFoundError } from "../../errors/professional/ProfessionalErrors.js";
import prismaClient from "../../prisma/index.js";
import { uploadImage } from "../../utils/uploadImage.js";

interface UpdateProfessionalServiceProps {
    tenantId: string;
    professionalId: string;
    name?: string | undefined;
    isActive?: boolean | undefined;
    photoBuffer?: Buffer | undefined;
    photoName?: string | undefined;
}

class UpdateProfessionalService {
    async execute({ tenantId, professionalId, name, isActive, photoBuffer, photoName }: UpdateProfessionalServiceProps) {

        const professional = await prismaClient.professional.findFirst({
            where: {
                id: professionalId,
                tenantId
            }
        });

        if (!professional) {
            throw new ProfessionalNotFoundError();
        }

        const photoUrl = photoBuffer && photoName
            ? await uploadImage({ buffer: photoBuffer, name: photoName, folder: `professionals/${tenantId}` })
            : undefined;

        const updated = await prismaClient.professional.update({
            where: {
                id: professional.id
            },
            data: {
                ...(name !== undefined && { name }),
                ...(isActive !== undefined && { isActive }),
                ...(photoUrl !== undefined && { photoUrl })
            },
            select: {
                id: true,
                tenantId: true,
                name: true,
                photoUrl: true,
                isActive: true,
                createdAt: true
            }
        });

        return updated;
    }
}

export { UpdateProfessionalService };
