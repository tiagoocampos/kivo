import { TenantNotFoundError } from "../../errors/tenant/TenantErrors.js";
import { SubscriptionCanceledError } from "../../errors/subscription/SubscriptionErrors.js";
import { getEffectivePlan } from "../../utils/subscriptionPlan.js";
import prismaClient from "../../prisma/index.js";

interface ResolveTenantOrThrowProps {
    slug: string;
}

// Resolução de tenant por slug compartilhada pelos services públicos
// (/booking/:slug/...) — centraliza a checagem de assinatura cancelada pra não
// duplicar essa lógica em cada service que busca tenant pelo slug. Diferente do
// Alô Delivery, todo tenant aqui já nasce com Subscription (RegisterTenantService
// cria na mesma transação), mas o `null` continua tratado por segurança.
async function resolveTenantOrThrow({ slug }: ResolveTenantOrThrowProps) {

    const tenant = await prismaClient.tenant.findUnique({
        where: {
            slug
        },
        select: {
            id: true,
            name: true,
            slug: true,
            phone: true,
            description: true,
            address: true,
            city: true,
            instagramUrl: true,
            logoUrl: true,
            bannerUrl: true,
            faviconUrl: true,
            timezone: true,
            businessHours: true,
            minCancelHoursBefore: true,
            isActive: true,
            subscription: {
                select: {
                    status: true,
                    monthlyPrice: true,
                    startedAt: true
                }
            }
        }
    });

    if (!tenant) {
        throw new TenantNotFoundError();
    }

    if (tenant.subscription?.status === "canceled") {
        throw new SubscriptionCanceledError();
    }

    const { subscription, ...rest } = tenant;

    return {
        ...rest,
        effectivePlan: getEffectivePlan(subscription)
    };
}

export { resolveTenantOrThrow };
