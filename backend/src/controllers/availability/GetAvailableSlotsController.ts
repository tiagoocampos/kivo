import { Request, Response } from "express";
import { GetAvailableSlotsService } from "../../services/availability/GetAvailableSlotsService.js";

class GetAvailableSlotsController {
    async handle(req: Request, res: Response) {
        const slug = req.params.slug as string;
        const { serviceId, professionalId, date } = req.query as {
            serviceId: string;
            professionalId?: string;
            date: string;
        };

        const getAvailableSlotsService = new GetAvailableSlotsService();
        const availability = await getAvailableSlotsService.execute({
            slug,
            serviceId,
            professionalId,
            date
        });

        return res.json(availability);
    }
}

export { GetAvailableSlotsController };
