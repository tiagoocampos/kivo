const TRIAL_DAYS = 30;

export type EffectivePlan = "completo" | "basico";

interface SubscriptionForPlan {
    status: string;
    monthlyPrice: number;
    startedAt: Date;
}

// Calculado na hora, nunca persistido: um tenant em trial vira "basico"
// automaticamente 30 dias após startedAt, sem precisar de nenhum job ou
// troca manual de status. O dono da plataforma continua podendo forçar
// "completo" ou "basico" a qualquer momento via status/monthlyPrice.
export function getEffectivePlan(subscription: SubscriptionForPlan | null): EffectivePlan {
    if (!subscription) return "completo"; // sem assinatura cadastrada ainda = não restringe (comportamento já existente)

    if (subscription.status === "active") {
        return subscription.monthlyPrice > 0 ? "completo" : "basico";
    }

    if (subscription.status === "overdue") return "completo"; // já decidido antes: atraso não bloqueia

    if (subscription.status === "trial") {
        const trialEnd = new Date(subscription.startedAt);
        trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);
        return new Date() < trialEnd ? "completo" : "basico";
    }

    return "basico"; // fallback defensivo — "canceled" já é bloqueado antes de chegar aqui, via resolveTenantOrThrow
}
