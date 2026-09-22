import { Request, Response } from "express";
import { UpdateMyTenantService } from "../../services/tenant/UpdateMyTenantService.js";

class UpdateMyTenantController {
    async handle(req: Request, res: Response) {
        const { name, phone, description, address, city, instagramUrl, minCancelHoursBefore, businessHours } = req.body;
        const files = req.files as { [field: string]: Express.Multer.File[] } | undefined;

        const updateMyTenantService = new UpdateMyTenantService();
        const tenant = await updateMyTenantService.execute({
            tenantId: req.auth.tenantId!,
            name,
            phone,
            description,
            address,
            city,
            instagramUrl,
            minCancelHoursBefore,
            businessHours,
            logoBuffer: files?.logo?.[0]?.buffer,
            logoName: files?.logo?.[0]?.originalname,
            bannerBuffer: files?.banner?.[0]?.buffer,
            bannerName: files?.banner?.[0]?.originalname,
            faviconBuffer: files?.favicon?.[0]?.buffer,
            faviconName: files?.favicon?.[0]?.originalname
        });

        return res.json(tenant);
    }
}

export { UpdateMyTenantController };
