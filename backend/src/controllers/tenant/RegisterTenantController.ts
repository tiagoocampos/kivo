import { Request, Response } from 'express';
import { RegisterTenantService } from '../../services/tenant/RegisterTenantService.js';

class RegisterTenantController {
    async handle(req: Request, res: Response) {
        const { barbershopName, ownerName, email, password } = req.body;

        const registerTenantService = new RegisterTenantService();
        const result = await registerTenantService.execute({
            barbershopName,
            ownerName,
            email,
            password
        });

        return res.status(201).json(result);
    }
}

export { RegisterTenantController };
