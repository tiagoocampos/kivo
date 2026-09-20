import { z } from "zod";
import { TIME_REGEX, timeToMinutes } from "../utils/time.js";

// Multipart manda "true"/"false" como string; aceita os dois formatos.
const formBoolean = z.preprocess(
    (value) => (value === "true" ? true : value === "false" ? false : value),
    z.boolean({ message: "Valor inválido" })
);

export const createProfessionalSchema =
    z.object({
        body: z.object({
            name: z.string().trim().min(1, { message: "O nome do profissional é obrigatório" }),
        })
    })

export const updateProfessionalSchema =
    z.object({
        params: z.object({
            id: z.string().uuid({ message: "Profissional inválido" }),
        }),
        body: z.object({
            name: z.string().trim().min(1, { message: "O nome do profissional é obrigatório" }).optional(),
            isActive: formBoolean.optional(),
        })
    })

export const deleteProfessionalSchema =
    z.object({
        params: z.object({
            id: z.string().uuid({ message: "Profissional inválido" }),
        })
    })

const workingIntervalSchema = z.object({
    dayOfWeek: z.number().int().min(0, { message: "Dia da semana inválido" }).max(6, { message: "Dia da semana inválido" }),
    startTime: z.string().regex(TIME_REGEX, { message: "Horário inválido, use HH:mm" }),
    endTime: z.string().regex(TIME_REGEX, { message: "Horário inválido, use HH:mm" }),
});

// Substitui a semana inteira do profissional. Lista vazia é válida: o
// profissional simplesmente não atende em nenhum dia.
export const setWorkingHoursSchema =
    z.object({
        params: z.object({
            id: z.string().uuid({ message: "Profissional inválido" }),
        }),
        body: z.object({
            intervals: z.array(workingIntervalSchema).max(50, { message: "Intervalos demais" }),
        }).superRefine((body, ctx) => {
            const byDay = new Map<number, { start: number; end: number }[]>();

            body.intervals.forEach((interval, index) => {
                const start = timeToMinutes(interval.startTime);
                const end = timeToMinutes(interval.endTime);

                if (start >= end) {
                    ctx.addIssue({
                        code: "custom",
                        message: "O horário de início deve ser anterior ao de término",
                        path: ["intervals", index, "endTime"],
                    });
                    return;
                }

                const sameDay = byDay.get(interval.dayOfWeek) ?? [];
                // Dois intervalos se sobrepõem quando cada um começa antes do outro terminar.
                if (sameDay.some((other) => start < other.end && other.start < end)) {
                    ctx.addIssue({
                        code: "custom",
                        message: "Os intervalos do mesmo dia não podem se sobrepor",
                        path: ["intervals", index, "startTime"],
                    });
                }

                sameDay.push({ start, end });
                byDay.set(interval.dayOfWeek, sameDay);
            });
        })
    })
