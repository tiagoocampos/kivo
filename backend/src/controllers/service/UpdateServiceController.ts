import { Request, Response } from 'express';
import { UpdateServiceService } from '../../services/service/UpdateServiceService.js';

class UpdateServiceController {
    async handle(req: Request, res: Response) {
        const { id } = req.params as { id: string };
        const { name, description, durationMinutes, price, isActive } = req.body;

        const updateServiceService = new UpdateServiceService();
        const service = await updateServiceService.execute({
            tenantId: req.auth.tenantId!,
            serviceId: id,
            name,
            description,
            durationMinutes,
            price,
            isActive
        });

        return res.json(service);
    }
}

export { UpdateServiceController };
