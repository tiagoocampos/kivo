import { Request, Response } from "express";
import { GetMyTenantService } from "../../services/tenant/GetMyTenantService.js";

class GetMyTenantController {
    async handle(req: Request, res: Response) {
        const getMyTenantService = new GetMyTenantService();

        const tenant = await getMyTenantService.execute({
            tenantId: req.auth.tenantId!
        });

        return res.json(tenant);
    }
}

export { GetMyTenantController };
