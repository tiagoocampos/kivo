import { Request, Response } from "express";
import { GetCustomerAppointmentsService } from "../../services/customer/GetCustomerAppointmentsService.js";

class GetCustomerAppointmentsController {
    async handle(req: Request, res: Response) {
        const { id } = req.params as { id: string };

        const getCustomerAppointmentsService = new GetCustomerAppointmentsService();
        const appointments = await getCustomerAppointmentsService.execute({
            tenantId: req.auth.tenantId!,
            customerId: id
        });

        return res.json(appointments);
    }
}

export { GetCustomerAppointmentsController };
