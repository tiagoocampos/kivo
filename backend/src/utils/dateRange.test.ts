import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { getDayRangeInTimezone, todayInTimezone, weekdayOf } from "./dateRange.js";

// Cenário específico do bug relatado: o SERVIDOR roda num fuso diferente do
// fuso do TENANT (produção no Railway é UTC; a barbearia é America/Sao_Paulo,
// UTC-3). Fixamos `now` perto da virada de dia em Brasília — já é o dia
// seguinte em UTC — e conferimos que o resultado é sempre o de Brasília,
// nunca o do processo. `process.env.TZ` não é lido em nenhum lugar destas
// funções (só Intl.DateTimeFormat com timeZone explícito e Date.UTC), então
// o valor de TZ do processo não deveria importar — o teste comprova isso.

const SAO_PAULO = "America/Sao_Paulo"; // UTC-3, sem horário de verão

describe("dateRange — servidor em fuso diferente do tenant (23:50 em Brasília)", () => {
    // 23:50 de 20/set em Brasília = 02:50 de 21/set em UTC — dias civis diferentes.
    const nearMidnightBrt = new Date("2026-09-21T02:50:00Z");

    test("todayInTimezone: ainda é dia 20 em Brasília, já é dia 21 em UTC", () => {
        assert.equal(todayInTimezone(SAO_PAULO, nearMidnightBrt), "2026-09-20");
        assert.equal(todayInTimezone("UTC", nearMidnightBrt), "2026-09-21");
    });

    test("weekdayOf usa o dia civil de Brasília, não o de UTC", () => {
        const today = todayInTimezone(SAO_PAULO, nearMidnightBrt);
        // 20/set/2026 é domingo; 21/set/2026 (o dia em UTC) seria segunda.
        assert.equal(weekdayOf(today), 0, "domingo em Brasília");
        assert.equal(weekdayOf(todayInTimezone("UTC", nearMidnightBrt)), 1, "já seria segunda em UTC");
    });

    test("getDayRangeInTimezone: o dia 'de hoje' em Brasília cobre o instante atual", () => {
        const today = todayInTimezone(SAO_PAULO, nearMidnightBrt);
        const { start, end } = getDayRangeInTimezone(today, SAO_PAULO);

        assert.ok(nearMidnightBrt >= start && nearMidnightBrt < end, "o instante 'agora' precisa cair dentro do dia civil de Brasília que ele mesmo determina");
        assert.equal(start.toISOString(), "2026-09-20T03:00:00.000Z");
        assert.equal(end.toISOString(), "2026-09-21T03:00:00.000Z");
    });

    // Mesma checagem 10 minutos depois, já virou o dia em Brasília também.
    test("10 minutos depois (00:00 em Brasília): já é o dia seguinte nos dois fusos", () => {
        const justAfterMidnightBrt = new Date("2026-09-21T03:00:00Z");
        assert.equal(todayInTimezone(SAO_PAULO, justAfterMidnightBrt), "2026-09-21");
        assert.equal(weekdayOf(todayInTimezone(SAO_PAULO, justAfterMidnightBrt)), 1, "segunda-feira");
    });

    test("resultado independe de process.env.TZ", () => {
        const original = process.env.TZ;
        try {
            for (const tz of ["UTC", "America/Sao_Paulo", "Asia/Tokyo"]) {
                process.env.TZ = tz;
                assert.equal(todayInTimezone(SAO_PAULO, nearMidnightBrt), "2026-09-20", `com process.env.TZ=${tz}`);
            }
        } finally {
            if (original === undefined) delete process.env.TZ;
            else process.env.TZ = original;
        }
    });
});
