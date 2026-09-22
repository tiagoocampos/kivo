import { Request, Response } from "express";
import { GetDashboardSummaryService } from "../../services/dashboard/GetDashboardSummaryService.js";

class GetDashboardSummaryController {
    async handle(req: Request, res: Response) {
        const getDashboardSummaryService = new GetDashboardSummaryService();

        const summary = await getDashboardSummaryService.execute({
            tenantId: req.auth.tenantId!
        });

        return res.json(summary);
    }
}

export { GetDashboardSummaryController };
