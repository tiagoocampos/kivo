import { Request, Response } from "express";
import { ListCustomersService } from "../../services/customer/ListCustomersService.js";

class ListCustomersController {
    async handle(req: Request, res: Response) {
        const listCustomersService = new ListCustomersService();

        const customers = await listCustomersService.execute({
            tenantId: req.auth.tenantId!
        });

        return res.json(customers);
    }
}

export { ListCustomersController };
