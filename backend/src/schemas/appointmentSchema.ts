import { z } from "zod";
import { dateOnlySchema } from "./sharedSchema.js";

export const listAppointmentsSchema =
    z.object({
        query: z.object({
            date: dateOnlySchema.optional(),
            professionalId: z.string().uuid({ message: "Profissional inválido" }).optional(),
        })
    })

// A rota /status nunca aceita "cancelado" como alvo — cancelamento é sempre
// pela rota /cancel dedicada (motivo opcional, canceledBy: "store").
export const updateAppointmentStatusSchema =
    z.object({
        params: z.object({
            id: z.string().uuid({ message: "Agendamento inválido" }),
        }),
        body: z.object({
            status: z.enum(["confirmado", "concluido", "nao_compareceu"], { message: "Status inválido" }),
        })
    })

export const cancelAppointmentByStoreSchema =
    z.object({
        params: z.object({
            id: z.string().uuid({ message: "Agendamento inválido" }),
        }),
        body: z.object({
            reason: z.string().trim().max(500, { message: "Motivo muito longo" }).optional(),
        })
    })
