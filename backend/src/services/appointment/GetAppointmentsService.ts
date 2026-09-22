import { TenantNotFoundError } from "../../errors/tenant/TenantErrors.js";
import prismaClient from "../../prisma/index.js";
import { getDayRangeInTimezone } from "../../utils/dateRange.js";
import { APPOINTMENT_SELECT } from "./appointmentSelect.js";

interface GetAppointmentsServiceProps {
    tenantId: string;
    // Ambos opcionais: sem date, devolve de todos os dias; sem professionalId,
    // de todos os profissionais. O painel sempre manda a data de hoje por padrão,
    // mas o service não assume isso — é decisão da tela, não da API.
    date?: string | undefined;
    professionalId?: string | undefined;
}

class GetAppointmentsService {
    async execute({ tenantId, date, professionalId }: GetAppointmentsServiceProps) {

        let scheduledAtFilter: { gte: Date; lt: Date } | undefined;

        if (date) {
            const tenant = await prismaClient.tenant.findUnique({
                where: { id: tenantId },
                select: { timezone: true }
            });

            if (!tenant) {
                throw new TenantNotFoundError();
            }

            const { start, end } = getDayRangeInTimezone(date, tenant.timezone);
            scheduledAtFilter = { gte: start, lt: end };
        }

        return prismaClient.appointment.findMany({
            where: {
                tenantId,
                ...(professionalId && { professionalId }),
                ...(scheduledAtFilter && { scheduledAt: scheduledAtFilter })
            },
            orderBy: {
                scheduledAt: "asc"
            },
            select: APPOINTMENT_SELECT
        });
    }
}

export { GetAppointmentsService };
