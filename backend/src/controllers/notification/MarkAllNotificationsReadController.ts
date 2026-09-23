import { Request, Response } from "express";
import { MarkAllNotificationsReadService } from "../../services/notification/MarkAllNotificationsReadService.js";

class MarkAllNotificationsReadController {
    async handle(req: Request, res: Response) {
        const markAllNotificationsReadService = new MarkAllNotificationsReadService();
        await markAllNotificationsReadService.execute({ tenantId: req.auth.tenantId! });

        return res.status(204).send();
    }
}

export { MarkAllNotificationsReadController };
