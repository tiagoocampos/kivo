import { Request, Response } from 'express';
import { UpdateProfessionalService } from '../../services/professional/UpdateProfessionalService.js';
import { parseFormBoolean } from '../../utils/form.js';

class UpdateProfessionalController {
    async handle(req: Request, res: Response) {
        const { id } = req.params as { id: string };
        const { name, isActive } = req.body;

        const updateProfessionalService = new UpdateProfessionalService();
        const professional = await updateProfessionalService.execute({
            tenantId: req.auth.tenantId!,
            professionalId: id,
            name,
            isActive: parseFormBoolean(isActive),
            photoBuffer: req.file?.buffer,
            photoName: req.file?.originalname
        });

        return res.json(professional);
    }
}

export { UpdateProfessionalController };
