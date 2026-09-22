import { z } from "zod";
import { TIME_REGEX } from "../utils/time.js";
import { dateOnlySchema, phoneSchema } from "./sharedSchema.js";

const slugParam = z.object({
    slug: z.string().min(1, { message: "A barbearia é obrigatória" }),
});

export const getPublicBookingSchema =
    z.object({
        params: slugParam
    })

export const getAvailabilitySchema =
    z.object({
        params: slugParam,
        query: z.object({
            serviceId: z.string().uuid({ message: "Serviço inválido" }),
            // Ausente = "qualquer profissional".
            professionalId: z.string().uuid({ message: "Profissional inválido" }).optional(),
            date: dateOnlySchema,
        })
    })

export const createAppointmentSchema =
    z.object({
        params: slugParam,
        body: z.object({
            serviceId: z.string().uuid({ message: "Serviço inválido" }),
            // Ausente = "qualquer profissional": o backend escolhe quem estiver livre.
            professionalId: z.string().uuid({ message: "Profissional inválido" }).optional(),
            // Dia e horário no fuso da barbearia (os mesmos que a consulta de disponibilidade devolve).
            date: dateOnlySchema,
            time: z.string().regex(TIME_REGEX, { message: "Horário inválido, use HH:mm" }),
            customerName: z.string().trim().min(1, { message: "O nome é obrigatório" }).max(120, { message: "Nome muito longo" }),
            customerPhone: phoneSchema,
        })
    })
