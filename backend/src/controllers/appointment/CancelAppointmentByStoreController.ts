import { Request, Response } from "express";
import { CancelAppointmentByStoreService } from "../../services/appointment/CancelAppointmentByStoreService.js";

class CancelAppointmentByStoreController {
    async handle(req: Request, res: Response) {
        const { id } = req.params as { id: string };
        const { reason } = req.body;

        const cancelAppointmentByStoreService = new CancelAppointmentByStoreService();
        const appointment = await cancelAppointmentByStoreService.execute({
            tenantId: req.auth.tenantId!,
            appointmentId: id,
            reason
        });

        return res.json(appointment);
    }
}

export { CancelAppointmentByStoreController };
