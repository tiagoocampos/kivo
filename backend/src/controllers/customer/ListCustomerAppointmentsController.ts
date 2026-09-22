import { Request, Response } from "express";
import { ListCustomerAppointmentsService } from "../../services/customer/ListCustomerAppointmentsService.js";

class ListCustomerAppointmentsController {
    async handle(req: Request, res: Response) {
        const slug = req.params.slug as string;

        const listCustomerAppointmentsService = new ListCustomerAppointmentsService();
        const appointments = await listCustomerAppointmentsService.execute({
            slug,
            customerId: req.customerAuth!.customerId,
            customerTenantId: req.customerAuth!.tenantId
        });

        return res.json(appointments);
    }
}

export { ListCustomerAppointmentsController };
