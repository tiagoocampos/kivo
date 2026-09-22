import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { evaluateCancellation } from "./cancellation.js";

const scheduledAt = new Date("2026-09-25T17:30:00Z"); // 14:30 em São Paulo
const hoursBefore = (hours: number) => new Date(scheduledAt.getTime() - hours * 3_600_000);

function evaluate(now: Date, overrides: Partial<Parameters<typeof evaluateCancellation>[0]> = {}) {
    return evaluateCancellation({ status: "agendado", scheduledAt, minCancelHoursBefore: 2, now, ...overrides });
}

describe("evaluateCancellation", () => {
    test("com bastante antecedência, pode", () => {
        assert.deepEqual(evaluate(hoursBefore(24)), { allowed: true });
    });

    test("faltando mais que o mínimo (2h01), pode", () => {
        assert.deepEqual(evaluate(new Date(hoursBefore(2).getTime() - 60_000)), { allowed: true });
    });

    test("exatamente no limite (faltam justo 2h), ainda pode", () => {
        assert.deepEqual(evaluate(hoursBefore(2)), { allowed: true });
    });

    test("um minuto depois do limite (faltam 1h59), não pode — fora do prazo", () => {
        assert.deepEqual(evaluate(new Date(hoursBefore(2).getTime() + 60_000)), { allowed: false, reason: "deadline" });
    });

    test("faltando 30 minutos, não pode", () => {
        assert.deepEqual(evaluate(hoursBefore(0.5)), { allowed: false, reason: "deadline" });
    });

    test("agendamento que já passou nunca pode, mesmo com antecedência 0", () => {
        const after = new Date(scheduledAt.getTime() + 60_000);
        assert.deepEqual(evaluate(after, { minCancelHoursBefore: 0 }), { allowed: false, reason: "deadline" });
    });

    test("antecedência configurável: com 0 horas, cancela até o horário marcado", () => {
        assert.deepEqual(evaluate(hoursBefore(0.1), { minCancelHoursBefore: 0 }), { allowed: true });
    });

    test("antecedência configurável: com 24 horas, 23h antes já não pode", () => {
        assert.deepEqual(evaluate(hoursBefore(23), { minCancelHoursBefore: 24 }), { allowed: false, reason: "deadline" });
        assert.deepEqual(evaluate(hoursBefore(25), { minCancelHoursBefore: 24 }), { allowed: true });
    });

    test("qualquer status diferente de 'agendado' não pode, mesmo com prazo de sobra", () => {
        for (const status of ["confirmado", "concluido", "cancelado", "nao_compareceu"] as const) {
            assert.deepEqual(evaluate(hoursBefore(48), { status }), { allowed: false, reason: "status" }, status);
        }
    });

    test("status errado tem prioridade sobre prazo (mensagem certa pro cliente)", () => {
        assert.deepEqual(evaluate(hoursBefore(0.5), { status: "concluido" }), { allowed: false, reason: "status" });
    });
});
