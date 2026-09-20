import { Request, Response } from 'express';
import { LoginTenantService } from '../../services/tenant/LoginTenantService.js';

class LoginTenantController {
    async handle(req: Request, res: Response) {
        const { email, password } = req.body;

        const loginTenantService = new LoginTenantService();
        const result = await loginTenantService.execute({ email, password });

        return res.status(200).json(result);
    }
}

export { LoginTenantController };
