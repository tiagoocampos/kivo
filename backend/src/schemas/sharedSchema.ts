import { z } from "zod";
import { isValidDateString } from "../utils/dateRange.js";

// Aceita telefone com qualquer formatação razoável — (54) 99906-7417,
// 54 99906 7417, +55 54999067417 etc. A validação olha só a contagem de
// dígitos; quem normaliza o valor de fato pra gravar/buscar no banco é o
// controller (validateSchema não reescreve req.body), usando normalizePhone.
export const phoneSchema = z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .refine((value) => value.length >= 10 && value.length <= 11, {
        message: "Telefone inválido",
    });


// Dia civil "YYYY-MM-DD" (no fuso da barbearia). Rejeita formato errado e datas
// que não existem no calendário (2026-02-30).
export const dateOnlySchema = z
    .string()
    .refine(isValidDateString, { message: "Data inválida, use YYYY-MM-DD" });
