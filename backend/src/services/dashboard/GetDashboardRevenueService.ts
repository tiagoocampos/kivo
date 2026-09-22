import { TenantNotFoundError } from "../../errors/tenant/TenantErrors.js";
import prismaClient from "../../prisma/index.js";
import { addDays, getDayRangeInTimezone, todayInTimezone } from "../../utils/dateRange.js";
import { getZonedParts } from "../../utils/timezone.js";

interface GetDashboardRevenueServiceProps {
    tenantId: string;
    days: number;
    now?: Date | undefined;
}

class GetDashboardRevenueService {
    async execute({ tenantId, days, now = new Date() }: GetDashboardRevenueServiceProps) {

        const tenant = await prismaClient.tenant.findUnique({
            where: { id: tenantId },
            select: { timezone: true }
        });

        if (!tenant) {
            throw new TenantNotFoundError();
        }

        const today = todayInTimezone(tenant.timezone, now);
        const startDate = addDays(today, -(days - 1)); // inclui hoje: `days` dias no total

        const { start } = getDayRangeInTimezone(startDate, tenant.timezone);
        const { end } = getDayRangeInTimezone(today, tenant.timezone); // fim de hoje = início de amanhã

        const appointments = await prismaClient.appointment.findMany({
            where: {
                tenantId,
                status: "concluido",
                scheduledAt: { gte: start, lt: end }
            },
            select: {
                scheduledAt: true,
                price: true
            }
        });

        const byDate = new Map<string, { totalRevenue: number; totalAppointments: number }>();
        for (const appointment of appointments) {
            const date = getZonedParts(appointment.scheduledAt, tenant.timezone).date;
            const entry = byDate.get(date) ?? { totalRevenue: 0, totalAppointments: 0 };
            entry.totalRevenue += appointment.price;
            entry.totalAppointments += 1;
            byDate.set(date, entry);
        }

        // Sem buracos: todo dia do período entra na série, mesmo sem nenhum
        // agendamento concluído (0), pra não quebrar o eixo do gráfico no painel.
        const series: { date: string; totalRevenue: number; totalAppointments: number }[] = [];
        for (let i = 0; i < days; i++) {
            const date = addDays(startDate, i);
            const entry = byDate.get(date) ?? { totalRevenue: 0, totalAppointments: 0 };
            series.push({ date, ...entry });
        }

        return series;
    }
}

export { GetDashboardRevenueService };
