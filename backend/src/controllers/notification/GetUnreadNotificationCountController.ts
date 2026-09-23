import { Request, Response } from "express";
import { GetUnreadNotificationCountService } from "../../services/notification/GetUnreadNotificationCountService.js";

class GetUnreadNotificationCountController {
    async handle(req: Request, res: Response) {
        const getUnreadNotificationCountService = new GetUnreadNotificationCountService();
        const result = await getUnreadNotificationCountService.execute({ tenantId: req.auth.tenantId! });

        return res.json(result);
    }
}

export { GetUnreadNotificationCountController };
