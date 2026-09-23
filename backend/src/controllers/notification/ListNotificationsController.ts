import { Request, Response } from "express";
import { ListNotificationsService } from "../../services/notification/ListNotificationsService.js";

class ListNotificationsController {
    async handle(req: Request, res: Response) {
        const { cursor, limit } = req.query as { cursor?: string; limit?: number };

        const listNotificationsService = new ListNotificationsService();
        const result = await listNotificationsService.execute({
            tenantId: req.auth.tenantId!,
            cursor,
            limit
        });

        return res.json(result);
    }
}

export { ListNotificationsController };
