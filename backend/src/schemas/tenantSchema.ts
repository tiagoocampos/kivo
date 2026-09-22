import { z } from "zod";
import { TIME_REGEX } from "../utils/time.js";

export const registerTenantSchema =
    z.object({
        body: z.object({
            barbershopName: z.string().trim().min(1, { message: "O nome da barbearia é obrigatório" }),
            ownerName: z.string().trim().min(1, { message: "O nome do responsável é obrigatório" }),
            email: z.string().email({ message: "E-mail inválido" }),
            password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
        })
    })

const businessHoursDaySchema = z.object({
    dayOfWeek: z.number().int().min(0, { message: "Dia da semana inválido" }).max(6, { message: "Dia da semana inválido" }),
    isClosed: z.boolean(),
    opensAt: z.string().regex(TIME_REGEX, { message: "Horário inválido, use HH:mm" }).nullable(),
    closesAt: z.string().regex(TIME_REGEX, { message: "Horário inválido, use HH:mm" }).nullable(),
});

// Os 7 dias da semana, sempre — o painel manda a semana inteira de uma vez
// (mesmo princípio do PUT .../working-hours de Professional).
const businessHoursArraySchema = z
    .array(businessHoursDaySchema)
    .length(7, { message: "Informe os 7 dias da semana" });

export const updateMyTenantSchema =
    z.object({
        body: z.object({
            name: z.string().trim().min(1, { message: "O nome da barbearia é obrigatório" }).optional(),
            // Campos de contato/texto livre — multipart sempre manda string (até
            // vazia, quando o dono limpa o campo), então não validamos formato aqui.
            phone: z.string().optional(),
            description: z.string().optional(),
            address: z.string().optional(),
            city: z.string().optional(),
            instagramUrl: z.string().url({ message: "URL do Instagram inválida" }).optional(),
            minCancelHoursBefore: z.preprocess(
                (value) => (typeof value === "string" ? Number(value) : value),
                z.number().int().min(0, { message: "A antecedência mínima não pode ser negativa" })
                    .max(168, { message: "No máximo 168 horas (7 dias)" })
            ).optional(),
            // Multipart não transmite array/objeto — chega como JSON serializado.
            businessHours: z.preprocess((value) => {
                if (typeof value !== "string") return value;
                try {
                    return JSON.parse(value);
                } catch {
                    return value;
                }
            }, businessHoursArraySchema).optional(),
        })
    })
