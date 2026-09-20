import { Request, Response } from 'express';
import { ListProfessionalsService } from '../../services/professional/ListProfessionalsService.js';

class ListProfessionalsController {
    async handle(req: Request, res: Response) {
        const listProfessionalsService = new ListProfessionalsService();

        const professionals = await listProfessionalsService.execute({
            tenantId: req.auth.tenantId!
        });

        return res.json(professionals);
    }
}

export { ListProfessionalsController };
