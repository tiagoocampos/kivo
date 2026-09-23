import { Request, Response } from "express";
import { SubscribeAppointmentPushService } from "../../services/push/SubscribeAppointmentPushService.js";

class SubscribeAppointmentPushController {
    async handle(req: Request, res: Response) {
        const { slug, id } = req.params as { slug: string; id: string };
        const { endpoint, keys } = req.body;

        const subscribeAppointmentPushService = new SubscribeAppointmentPushService();
        await subscribeAppointmentPushService.execute({
            slug,
            appointmentId: id,
            endpoint,
            p256dh: keys.p256dh,
            auth: keys.auth
        });

        return res.status(201).json({ message: "Assinatura registrada" });
    }
}

export { SubscribeAppointmentPushController };
