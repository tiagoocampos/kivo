import { ProfessionalNotFoundError } from "../../errors/professional/ProfessionalErrors.js";
import { ServiceNotFoundError } from "../../errors/service/ServiceErrors.js";
import { TenantInactiveError } from "../../errors/tenant/TenantErrors.js";
import prismaClient from "../../prisma/index.js";
import { resolveTenantOrThrow } from "../tenant/resolveTenantOrThrow.js";
import { computeProfessionalSlots } from "./computeProfessionalSlots.js";

interface GetAvailableSlotsServiceProps {
    slug: string;
    serviceId: string;
    date: string; // "YYYY-MM-DD" no fuso da barbearia
    professionalId?: string | undefined;
    now?: Date | undefined;
}

class GetAvailableSlotsService {
    async execute({ slug, serviceId, date, professionalId, now = new Date() }: GetAvailableSlotsServiceProps) {

        const tenant = await resolveTenantOrThrow({ slug });

        if (!tenant.isActive) {
            throw new TenantInactiveError();
        }

        // Serviço e profissional precisam ser DESTA barbearia e estar ativos —
        // um id de outra barbearia é "não encontrado", nunca vaza.
        const service = await prismaClient.service.findFirst({
            where: {
                id: serviceId,
                tenantId: tenant.id,
                isActive: true
            },
            select: {
                durationMinutes: true
            }
        });

        if (!service) {
            throw new ServiceNotFoundError();
        }

        const slotsFor = (id: string) =>
            computeProfessionalSlots(prismaClient, {
                professionalId: id,
                serviceDurationMinutes: service.durationMinutes,
                date,
                timezone: tenant.timezone,
                now
            });

        if (professionalId) {
            const professional = await prismaClient.professional.findFirst({
                where: {
                    id: professionalId,
                    tenantId: tenant.id,
                    isActive: true
                },
                select: {
                    id: true
                }
            });

            if (!professional) {
                throw new ProfessionalNotFoundError();
            }

            return {
                professionalId: professional.id,
                slots: await slotsFor(professional.id)
            };
        }

        // "Qualquer profissional": o cálculo de cada um, separado — quem consome
        // decide como juntar/exibir.
        const professionals = await prismaClient.professional.findMany({
            where: {
                tenantId: tenant.id,
                isActive: true
            },
            orderBy: [
                { name: "asc" },
                { id: "asc" }
            ],
            select: {
                id: true,
                name: true
            }
        });

        return Promise.all(
            professionals.map(async (professional) => ({
                professionalId: professional.id,
                professionalName: professional.name,
                slots: await slotsFor(professional.id)
            }))
        );
    }
}

export { GetAvailableSlotsService };
