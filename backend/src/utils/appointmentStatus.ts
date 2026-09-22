import type { AppointmentStatus } from "../generated/prisma/enums.js";

// Máquina de estados do agendamento do lado da loja. "cancelado" é alcançável a
// partir de "agendado"/"confirmado", mas só pela rota /cancel (motivo opcional,
// canceledBy: "store") — a rota /status nunca aceita "cancelado" como alvo (ver
// updateAppointmentStatusSchema). Os três estados finais não têm saída.
const TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
    agendado: ["confirmado", "cancelado"],
    confirmado: ["concluido", "cancelado", "nao_compareceu"],
    concluido: [],
    cancelado: [],
    nao_compareceu: []
};

export function canTransitionTo(current: AppointmentStatus, target: AppointmentStatus): boolean {
    return TRANSITIONS[current].includes(target);
}

// Usado pela rota /cancel: só permitido a partir dos dois estados não-finais.
export function canCancelFromStatus(status: AppointmentStatus): boolean {
    return TRANSITIONS[status].includes("cancelado");
}
