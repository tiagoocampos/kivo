import { Request, Response } from 'express';
import { CreateServiceService } from '../../services/service/CreateServiceService.js';

class CreateServiceController {
    async handle(req: Request, res: Response) {
        const { name, description, durationMinutes, price } = req.body;

        const createServiceService = new CreateServiceService();
        const service = await createServiceService.execute({
            tenantId: req.auth.tenantId!,
            name,
            description,
            durationMinutes,
            price
        });

        return res.status(201).json(service);
    }
}

export { CreateServiceController };
