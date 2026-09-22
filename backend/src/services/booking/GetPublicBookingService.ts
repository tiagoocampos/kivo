import { TenantInactiveError } from "../../errors/tenant/TenantErrors.js";
import prismaClient from "../../prisma/index.js";
import { resolveTenantOrThrow } from "../tenant/resolveTenantOrThrow.js";

interface GetPublicBookingServiceProps {
    slug: string;
}

// Tudo que a página pública de agendamento precisa numa resposta só: a
// barbearia, o que ela oferece e quem atende. Só sai o que é público e está ativo.
class GetPublicBookingService {
    async execute({ slug }: GetPublicBookingServiceProps) {

        const tenant = await resolveTenantOrThrow({ slug });

        if (!tenant.isActive) {
            throw new TenantInactiveError();
        }

        const services = await prismaClient.service.findMany({
            where: {
                tenantId: tenant.id,
                isActive: true
            },
            orderBy: {
                name: "asc"
            },
            select: {
                id: true,
                name: true,
                description: true,
                durationMinutes: true,
                price: true
            }
        });

        const professionals = await prismaClient.professional.findMany({
            where: {
                tenantId: tenant.id,
                isActive: true
            },
            orderBy: {
                name: "asc"
            },
            select: {
                id: true,
                name: true,
                photoUrl: true
            }
        });

        // Lista explícita de campos (nada de espalhar o registro do banco): o que
        // não está aqui — assinatura, plano, isActive — não sai pela rota pública.
        return {
            tenant: {
                id: tenant.id,
                name: tenant.name,
                slug: tenant.slug,
                phone: tenant.phone,
                description: tenant.description,
                address: tenant.address,
                city: tenant.city,
                instagramUrl: tenant.instagramUrl,
                logoUrl: tenant.logoUrl,
                bannerUrl: tenant.bannerUrl,
                faviconUrl: tenant.faviconUrl,
                timezone: tenant.timezone,
                businessHours: tenant.businessHours,
                minCancelHoursBefore: tenant.minCancelHoursBefore
            },
            services,
            professionals
        };
    }
}

export { GetPublicBookingService };
