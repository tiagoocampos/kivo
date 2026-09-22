import { TenantNotFoundError } from "../../errors/tenant/TenantErrors.js";
import { getEffectivePlan } from "../../utils/subscriptionPlan.js";
import prismaClient from "../../prisma/index.js";
import { TENANT_SELECT } from "./tenantSelect.js";

interface GetMyTenantServiceProps {
    tenantId: string;
}

class GetMyTenantService {
    async execute({ tenantId }: GetMyTenantServiceProps) {

        const tenant = await prismaClient.tenant.findUnique({
            where: {
                id: tenantId
            },
            select: TENANT_SELECT
        });

        if (!tenant) {
            throw new TenantNotFoundError();
        }

        const { subscription, ...rest } = tenant;

        return {
            ...rest,
            subscription,
            effectivePlan: getEffectivePlan(subscription)
        };
    }
}

export { GetMyTenantService };
