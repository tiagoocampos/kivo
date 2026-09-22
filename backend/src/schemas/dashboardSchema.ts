import { z } from "zod";

export const getDashboardRevenueSchema =
    z.object({
        query: z.object({
            days: z.preprocess(
                (value) => (typeof value === "string" ? Number(value) : value),
                z.number().int().min(1, { message: "Informe pelo menos 1 dia" }).max(365, { message: "No máximo 365 dias" })
            ).optional(),
        })
    })
