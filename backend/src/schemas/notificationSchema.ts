import { z } from "zod";

export const listNotificationsSchema = z.object({
    query: z.object({
        cursor: z.string().uuid({ message: "Cursor inválido" }).optional(),
        limit: z.preprocess(
            (value) => (typeof value === "string" ? Number(value) : value),
            z.number().int().min(1, { message: "Informe pelo menos 1" }).max(100, { message: "No máximo 100" })
        ).optional(),
    })
});
