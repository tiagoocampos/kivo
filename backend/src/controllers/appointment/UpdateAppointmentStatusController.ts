import { Request, Response } from "express";
import { UpdateAppointmentStatusService } from "../../services/appointment/UpdateAppointmentStatusService.js";

class UpdateAppointmentStatusController {
    async handle(req: Request, res: Response) {
        const { id } = req.params as { id: string };
        const { status } = req.body;

        const updateAppointmentStatusService = new UpdateAppointmentStatusService();
        const appointment = await updateAppointmentStatusService.execute({
            tenantId: req.auth.tenantId!,
            appointmentId: id,
            status
        });

        return res.json(appointment);
    }
}

export { UpdateAppointmentStatusController };
