import { Request, Response } from "express";
import { GetAppointmentsService } from "../../services/appointment/GetAppointmentsService.js";

class ListAppointmentsController {
    async handle(req: Request, res: Response) {
        const { date, professionalId } = req.query as { date?: string; professionalId?: string };

        const getAppointmentsService = new GetAppointmentsService();
        const appointments = await getAppointmentsService.execute({
            tenantId: req.auth.tenantId!,
            date,
            professionalId
        });

        return res.json(appointments);
    }
}

export { ListAppointmentsController };
