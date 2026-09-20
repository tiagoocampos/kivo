import { Request, Response } from 'express';
import { DeleteProfessionalService } from '../../services/professional/DeleteProfessionalService.js';

class DeleteProfessionalController {
    async handle(req: Request, res: Response) {
        const { id } = req.params as { id: string };

        const deleteProfessionalService = new DeleteProfessionalService();
        await deleteProfessionalService.execute({
            tenantId: req.auth.tenantId!,
            professionalId: id
        });

        return res.status(204).send();
    }
}

export { DeleteProfessionalController };
