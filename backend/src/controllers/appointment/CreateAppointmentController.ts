import { Request, Response } from "express";
import { CreateAppointmentService } from "../../services/appointment/CreateAppointmentService.js";

class CreateAppointmentController {
    async handle(req: Request, res: Response) {
        const slug = req.params.slug as string;
        const { serviceId, professionalId, date, time, customerName, customerPhone } = req.body;

        const createAppointmentService = new CreateAppointmentService();
        const appointment = await createAppointmentService.execute({
            slug,
            serviceId,
            professionalId,
            date,
            time,
            customerName,
            customerPhone,
            customerAuth: req.customerAuth
        });

        return res.status(201).json(appointment);
    }
}

export { CreateAppointmentController };
