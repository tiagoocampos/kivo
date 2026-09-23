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

            return slotsFor(professional.id);
        }

        // "Qualquer profissional": união dos horários livres de todos, sem
        // repetir — pro storefront é só uma lista de "HH:mm" pra escolher,
        // sem se importar com quem vai atender (o backend decide isso na hora
        // de criar o agendamento).
        const professionals = await prismaClient.professional.findMany({
            where: {
                tenantId: tenant.id,
                isActive: true
            },
            select: {
                id: true
            }
        });

        const slotsByProfessional = await Promise.all(
            professionals.map((professional) => slotsFor(professional.id))
        );

        return [...new Set(slotsByProfessional.flat())].sort();
    }
}

export { GetAvailableSlotsService };
