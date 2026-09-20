import { Request, Response } from 'express';
import { DeleteServiceService } from '../../services/service/DeleteServiceService.js';

class DeleteServiceController {
    async handle(req: Request, res: Response) {
        const { id } = req.params as { id: string };

        const deleteServiceService = new DeleteServiceService();
        await deleteServiceService.execute({
            tenantId: req.auth.tenantId!,
            serviceId: id
        });

        return res.status(204).send();
    }
}

export { DeleteServiceController };
