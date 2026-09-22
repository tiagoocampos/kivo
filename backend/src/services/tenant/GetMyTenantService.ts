import { TenantNotFoundError } from "../../errors/tenant/TenantErrors.js";
import { getEffectivePlan } from "../../utils/subscriptionPlan.js";
import prismaClient from "../../prisma/index.js";

interface GetMyTenantServiceProps {
    tenantId: string;
}

class GetMyTenantService {
    async execute({ tenantId }: GetMyTenantServiceProps) {

        const tenant = await prismaClient.tenant.findUnique({
            where: {
                id: tenantId
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
                // Já existe na tabela desde a fase de agendamento (usado por
                // CancelCustomerAppointmentService), mas nunca tinha sido exposto pro
                // próprio painel conseguir ler/exibir o valor atual.
                minCancelHoursBefore: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
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

        const { subscription, ...rest } = tenant;

        return {
            ...rest,
            subscription,
            effectivePlan: getEffectivePlan(subscription)
        };
    }
}

export { GetMyTenantService };
