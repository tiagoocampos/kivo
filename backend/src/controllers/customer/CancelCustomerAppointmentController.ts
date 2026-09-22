import { Request, Response } from "express";
import { CancelCustomerAppointmentService } from "../../services/customer/CancelCustomerAppointmentService.js";

class CancelCustomerAppointmentController {
    async handle(req: Request, res: Response) {
        const slug = req.params.slug as string;
        const appointmentId = req.params.id as string;
        const { reason } = req.body;

        const cancelCustomerAppointmentService = new CancelCustomerAppointmentService();
        const appointment = await cancelCustomerAppointmentService.execute({
            slug,
            appointmentId,
            customerId: req.customerAuth!.customerId,
            customerTenantId: req.customerAuth!.tenantId,
            reason
        });

        return res.json(appointment);
    }
}

export { CancelCustomerAppointmentController };
