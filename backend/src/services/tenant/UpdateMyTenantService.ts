import { Prisma } from "../../generated/prisma/client.js";
import { TenantNotFoundError } from "../../errors/tenant/TenantErrors.js";
import { getEffectivePlan } from "../../utils/subscriptionPlan.js";
import { uploadImage } from "../../utils/uploadImage.js";
import prismaClient from "../../prisma/index.js";
import { TENANT_SELECT } from "./tenantSelect.js";

interface UpdateMyTenantServiceProps {
    tenantId: string;
    name?: string | undefined;
    phone?: string | undefined;
    description?: string | undefined;
    address?: string | undefined;
    city?: string | undefined;
    instagramUrl?: string | undefined;
    minCancelHoursBefore?: number | undefined;
    businessHours?: Prisma.InputJsonValue | undefined;
    logoBuffer?: Buffer | undefined;
    logoName?: string | undefined;
    bannerBuffer?: Buffer | undefined;
    bannerName?: string | undefined;
    faviconBuffer?: Buffer | undefined;
    faviconName?: string | undefined;
}

class UpdateMyTenantService {
    async execute({
        tenantId,
        name,
        phone,
        description,
        address,
        city,
        instagramUrl,
        minCancelHoursBefore,
        businessHours,
        logoBuffer,
        logoName,
        bannerBuffer,
        bannerName,
        faviconBuffer,
        faviconName
    }: UpdateMyTenantServiceProps) {

        const tenant = await prismaClient.tenant.findUnique({
            where: {
                id: tenantId
            },
            select: {
                id: true
            }
        });

        if (!tenant) {
            throw new TenantNotFoundError();
        }

        // Cada imagem só sobe se um arquivo novo veio junto — sem upload, o valor
        // atual no banco é mantido (undefined não entra no `data` do update).
        const logoUrl = logoBuffer && logoName
            ? await uploadImage({ buffer: logoBuffer, name: logoName, folder: `branding/${tenantId}/logo` })
            : undefined;

        const bannerUrl = bannerBuffer && bannerName
            ? await uploadImage({ buffer: bannerBuffer, name: bannerName, folder: `branding/${tenantId}/banner` })
            : undefined;

        const faviconUrl = faviconBuffer && faviconName
            ? await uploadImage({ buffer: faviconBuffer, name: faviconName, folder: `branding/${tenantId}/favicon` })
            : undefined;

        const updated = await prismaClient.tenant.update({
            where: {
                id: tenant.id
            },
            data: {
                ...(name !== undefined && { name }),
                ...(phone !== undefined && { phone }),
                ...(description !== undefined && { description }),
                ...(address !== undefined && { address }),
                ...(city !== undefined && { city }),
                ...(instagramUrl !== undefined && { instagramUrl }),
                ...(minCancelHoursBefore !== undefined && { minCancelHoursBefore }),
                ...(businessHours !== undefined && { businessHours }),
                ...(logoUrl !== undefined && { logoUrl }),
                ...(bannerUrl !== undefined && { bannerUrl }),
                ...(faviconUrl !== undefined && { faviconUrl })
            },
            select: TENANT_SELECT
        });

        const { subscription, ...rest } = updated;

        return {
            ...rest,
            subscription,
            effectivePlan: getEffectivePlan(subscription)
        };
    }
}

export { UpdateMyTenantService };
