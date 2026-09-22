import { Request, Response } from "express";
import { GetPublicBookingService } from "../../services/booking/GetPublicBookingService.js";

class GetPublicBookingController {
    async handle(req: Request, res: Response) {
        const slug = req.params.slug as string;

        const getPublicBookingService = new GetPublicBookingService();
        const booking = await getPublicBookingService.execute({ slug });

        return res.json(booking);
    }
}

export { GetPublicBookingController };
