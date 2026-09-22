import { TenantNotFoundError } from "../../errors/tenant/TenantErrors.js";
import prismaClient from "../../prisma/index.js";
import { getDayRangeInTimezone, getMonthKeyInTimezone, getMonthRangeInTimezone, todayInTimezone } from "../../utils/dateRange.js";

interface GetDashboardSummaryServiceProps {
    tenantId: string;
    now?: Date | undefined;
}

// "Hoje" só conta agendamentos realmente concluídos como faturamento — é um
// número "de verdade", já acontecido. Os totais do mês são mais amplos (tudo
// que não foi cancelado: já concluído ou ainda agendado/confirmado), porque
// servem pra medir o volume de agenda do mês, não só o que já foi cobrado.
async function getMonthSummary(tenantId: string, timezone: string, monthsAgo: number) {
    const monthKey = getMonthKeyInTimezone(timezone, monthsAgo);
    const { start, end } = getMonthRangeInTimezone(monthKey, timezone);

    const aggregate = await prismaClient.appointment.aggregate({
        where: {
            tenantId,
            scheduledAt: { gte: start, lt: end },
            status: { not: "cancelado" }
        },
        _sum: { price: true },
        _count: { _all: true }
    });

    return {
        totalRevenue: aggregate._sum.price ?? 0,
        totalAppointments: aggregate._count._all
    };
}

class GetDashboardSummaryService {
    async execute({ tenantId, now = new Date() }: GetDashboardSummaryServiceProps) {

        const tenant = await prismaClient.tenant.findUnique({
            where: { id: tenantId },
            select: { timezone: true }
        });

        if (!tenant) {
            throw new TenantNotFoundError();
        }

        const today = todayInTimezone(tenant.timezone, now);
        const { start: todayStart, end: todayEnd } = getDayRangeInTimezone(today, tenant.timezone);

        const [appointmentsToday, completedToday, canceledToday, revenueTodayAggregate, currentMonth, previousMonth] =
            await Promise.all([
                prismaClient.appointment.count({
                    where: { tenantId, scheduledAt: { gte: todayStart, lt: todayEnd } }
                }),
                prismaClient.appointment.count({
                    where: { tenantId, scheduledAt: { gte: todayStart, lt: todayEnd }, status: "concluido" }
                }),
                prismaClient.appointment.count({
                    where: { tenantId, scheduledAt: { gte: todayStart, lt: todayEnd }, status: "cancelado" }
                }),
                prismaClient.appointment.aggregate({
                    where: { tenantId, scheduledAt: { gte: todayStart, lt: todayEnd }, status: "concluido" },
                    _sum: { price: true }
                }),
                getMonthSummary(tenantId, tenant.timezone, 0),
                getMonthSummary(tenantId, tenant.timezone, 1)
            ]);

        return {
            today: {
                appointmentsToday,
                completedToday,
                canceledToday,
                revenueToday: revenueTodayAggregate._sum.price ?? 0
            },
            currentMonth,
            previousMonth
        };
    }
}

export { GetDashboardSummaryService };
