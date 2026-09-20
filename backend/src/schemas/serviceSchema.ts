import { z } from "zod";

const durationSchema = z.number()
    .int({ message: "A duração deve ser um número inteiro de minutos" })
    .min(5, { message: "A duração mínima é de 5 minutos" })
    .max(480, { message: "A duração máxima é de 8 horas" });

const priceSchema = z.number()
    .int({ message: "O preço deve ser um inteiro em centavos" })
    .min(0, { message: "O preço não pode ser negativo" });

export const createServiceSchema =
    z.object({
        body: z.object({
            name: z.string().trim().min(1, { message: "O nome do serviço é obrigatório" }),
            description: z.string().trim().optional(),
            durationMinutes: durationSchema,
            price: priceSchema,
        })
    })

export const updateServiceSchema =
    z.object({
        params: z.object({
            id: z.string().uuid({ message: "Serviço inválido" }),
        }),
        body: z.object({
            name: z.string().trim().min(1, { message: "O nome do serviço é obrigatório" }).optional(),
            description: z.string().trim().nullable().optional(),
            durationMinutes: durationSchema.optional(),
            price: priceSchema.optional(),
            isActive: z.boolean().optional(),
        })
    })

export const deleteServiceSchema =
    z.object({
        params: z.object({
            id: z.string().uuid({ message: "Serviço inválido" }),
        })
    })
