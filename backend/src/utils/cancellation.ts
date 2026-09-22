import type { AppointmentStatus } from "../generated/prisma/enums.js";

const HOUR_MS = 60 * 60 * 1000;

export type CancellationDecision =
    | { allowed: true }
    | { allowed: false; reason: "status" | "deadline" };

interface EvaluateCancellationInput {
    status: AppointmentStatus;
    scheduledAt: Date;
    minCancelHoursBefore: number;
    now: Date;
}

// Regra de cancelamento pelo cliente: só enquanto o status é "agendado" E faltando
// pelo menos `minCancelHoursBefore` horas pro horário marcado. Exatamente no limite
// (faltam justo as horas mínimas) ainda pode; um minuto depois, não. Um agendamento
// que já passou nunca pode ser cancelado, mesmo com antecedência 0.
export function evaluateCancellation({
    status,
    scheduledAt,
    minCancelHoursBefore,
    now
}: EvaluateCancellationInput): CancellationDecision {
    if (status !== "agendado") {
        return { allowed: false, reason: "status" };
    }

    const deadline = scheduledAt.getTime() - minCancelHoursBefore * HOUR_MS;

    if (now.getTime() > deadline) {
        return { allowed: false, reason: "deadline" };
    }

    return { allowed: true };
}
