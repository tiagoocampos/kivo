import { Request, Response } from 'express';
import { CreateProfessionalService } from '../../services/professional/CreateProfessionalService.js';

class CreateProfessionalController {
    async handle(req: Request, res: Response) {
        const { name } = req.body;

        const createProfessionalService = new CreateProfessionalService();
        const professional = await createProfessionalService.execute({
            tenantId: req.auth.tenantId!,
            name,
            photoBuffer: req.file?.buffer,
            photoName: req.file?.originalname
        });

        return res.status(201).json(professional);
    }
}

export { CreateProfessionalController };
