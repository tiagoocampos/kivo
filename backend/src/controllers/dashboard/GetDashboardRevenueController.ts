import { Request, Response } from "express";
import { GetDashboardRevenueService } from "../../services/dashboard/GetDashboardRevenueService.js";

class GetDashboardRevenueController {
    async handle(req: Request, res: Response) {
        const days = req.query.days ? Number(req.query.days) : 30;

        const getDashboardRevenueService = new GetDashboardRevenueService();
        const series = await getDashboardRevenueService.execute({
            tenantId: req.auth.tenantId!,
            days
        });

        return res.json(series);
    }
}

export { GetDashboardRevenueController };
