import { minutesToTime, timeToMinutes } from "./time.js";

// Granularidade dos horários oferecidos ao cliente (de 30 em 30 minutos).
export const SLOT_GRANULARITY_MINUTES = 30;

export interface WorkingInterval {
    startTime: string; // "HH:mm"
    endTime: string; // "HH:mm"
}

// Agendamento já existente, em minutos desde a meia-noite local do dia consultado.
export interface BusyInterval {
    startMinutes: number;
    endMinutes: number;
}

export interface ComputeAvailableSlotsInput {
    // Expediente do profissional NAQUELE dia da semana (pode ter mais de um
    // intervalo — é assim que a pausa de almoço aparece).
    workingHours: WorkingInterval[];
    // Agendamentos do profissional no dia, exceto os cancelados.
    existingAppointments: BusyInterval[];
    serviceDurationMinutes: number;
    slotGranularityMinutes: number;
    // Minutos desde a meia-noite local AGORA, quando a data consultada é hoje;
    // null quando é um dia futuro (nada a descartar). Horário que já passou, ou
    // que é exatamente agora, não é oferecido.
    nowMinutes: number | null;
}

// Função pura: sem banco, sem relógio, sem fuso — quem chama converte instantes
// em minutos do dia local (é o que faz o resto do sistema, ver
// services/availability/computeProfessionalSlots.ts).
//
// Um horário é livre se o serviço pedido INTEIRO cabe dentro de um intervalo de
// expediente e não encosta em nenhum agendamento existente. A colisão usa a
// duração do serviço pedido (não a de um serviço padrão) e a duração real de cada
// agendamento que já está na agenda; agendamentos que só se encostam
// (um termina às 10:00, o outro começa às 10:00) NÃO colidem.
export function computeAvailableSlots({
    workingHours,
    existingAppointments,
    serviceDurationMinutes,
    slotGranularityMinutes,
    nowMinutes
}: ComputeAvailableSlotsInput): string[] {
    // Proteção contra laço infinito / resultado sem sentido com entrada inválida.
    if (serviceDurationMinutes <= 0 || slotGranularityMinutes <= 0) return [];

    const free = new Set<number>();

    for (const interval of workingHours) {
        const intervalStart = timeToMinutes(interval.startTime);
        const intervalEnd = timeToMinutes(interval.endTime);

        // Os horários partem do início de cada intervalo, de granularidade em granularidade.
        for (let start = intervalStart; start + serviceDurationMinutes <= intervalEnd; start += slotGranularityMinutes) {
            if (nowMinutes !== null && start <= nowMinutes) continue;

            const end = start + serviceDurationMinutes;
            const collides = existingAppointments.some(
                (appointment) => start < appointment.endMinutes && appointment.startMinutes < end
            );

            if (!collides) free.add(start);
        }
    }

    return [...free].sort((a, b) => a - b).map(minutesToTime);
}
