import { Request, Response } from "express";
import { SubscribeUserPushService } from "../../services/push/SubscribeUserPushService.js";

class SubscribeUserPushController {
    async handle(req: Request, res: Response) {
        const { endpoint, keys } = req.body;

        const subscribeUserPushService = new SubscribeUserPushService();
        await subscribeUserPushService.execute({
            userId: req.auth.userId,
            endpoint,
            p256dh: keys.p256dh,
            auth: keys.auth
        });

        return res.status(201).json({ message: "Assinatura registrada" });
    }
}

export { SubscribeUserPushController };
