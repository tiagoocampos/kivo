import { z } from "zod";
import { phoneSchema } from "./sharedSchema.js";

const slugParam = z.object({
    slug: z.string().min(1, { message: "A barbearia é obrigatória" }),
});

export const registerCustomerSchema =
    z.object({
        params: slugParam,
        body: z.object({
            name: z.string().trim().min(1, { message: "O nome é obrigatório" }).max(120, { message: "Nome muito longo" }),
            phone: phoneSchema,
            email: z.string().email({ message: "E-mail inválido" }).optional(),
            password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
        })
    })

export const loginCustomerSchema =
    z.object({
        params: slugParam,
        body: z.object({
            phone: phoneSchema,
            password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
        })
    })

export const getCustomerMeSchema =
    z.object({
        params: slugParam
    })

export const listCustomerAppointmentsSchema =
    z.object({
        params: slugParam
    })

export const cancelCustomerAppointmentSchema =
    z.object({
        params: slugParam.extend({
            id: z.string().uuid({ message: "Agendamento inválido" }),
        }),
        body: z.object({
            reason: z.string().trim().min(1, { message: "Informe o motivo do cancelamento" }).max(500, { message: "Motivo muito longo" }),
        })
    })
