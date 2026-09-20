import { Request, Response } from 'express';
import { ListServicesService } from '../../services/service/ListServicesService.js';

class ListServicesController {
    async handle(req: Request, res: Response) {
        const listServicesService = new ListServicesService();

        const services = await listServicesService.execute({
            tenantId: req.auth.tenantId!
        });

        return res.json(services);
    }
}

export { ListServicesController };
