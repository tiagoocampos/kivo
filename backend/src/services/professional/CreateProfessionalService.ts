import prismaClient from "../../prisma/index.js";
import { uploadImage } from "../../utils/uploadImage.js";

interface CreateProfessionalServiceProps {
    tenantId: string;
    name: string;
    photoBuffer?: Buffer | undefined;
    photoName?: string | undefined;
}

class CreateProfessionalService {
    async execute({ tenantId, name, photoBuffer, photoName }: CreateProfessionalServiceProps) {

        const photoUrl = photoBuffer && photoName
            ? await uploadImage({ buffer: photoBuffer, name: photoName, folder: `professionals/${tenantId}` })
            : null;

        const professional = await prismaClient.professional.create({
            data: {
                tenantId,
                name,
                photoUrl
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

        return professional;
    }
}

export { CreateProfessionalService };
