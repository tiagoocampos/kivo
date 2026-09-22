import { Request, Response } from "express";
import { GetCustomerMeService } from "../../services/customer/GetCustomerMeService.js";

class GetCustomerMeController {
    async handle(req: Request, res: Response) {
        const getCustomerMeService = new GetCustomerMeService();
        const customer = await getCustomerMeService.execute({
            tenantId: req.customerAuth!.tenantId,
            customerId: req.customerAuth!.customerId
        });

        return res.json(customer);
    }
}

export { GetCustomerMeController };
