import { Request, Response } from "express";
import { GetAppointmentService } from "../../services/appointment/GetAppointmentService.js";

class GetAppointmentController {
    async handle(req: Request, res: Response) {
        const { id } = req.params as { id: string };

        const getAppointmentService = new GetAppointmentService();
        const appointment = await getAppointmentService.execute({
            tenantId: req.auth.tenantId!,
            appointmentId: id
        });

        return res.json(appointment);
    }
}

export { GetAppointmentController };
