import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { getZonedParts, isValidTimezone, zonedTimeToUtc } from "./timezone.js";
import { addDays, getDayRangeInTimezone, isValidDateString, todayInTimezone, weekdayOf } from "./dateRange.js";

const SAO_PAULO = "America/Sao_Paulo"; // UTC-3, sem horário de verão
const NEW_YORK = "America/New_York"; // tem horário de verão

describe("timezone", () => {
    test("isValidTimezone", () => {
        assert.equal(isValidTimezone(SAO_PAULO), true);
        assert.equal(isValidTimezone("Marte/Olympus"), false);
    });

    test("getZonedParts: o mesmo instante em fusos diferentes", () => {
        const instant = new Date("2026-09-21T01:30:00Z");
        assert.deepEqual(getZonedParts(instant, SAO_PAULO), { date: "2026-09-20", time: "22:30", minutes: 22 * 60 + 30, seconds: 0 });
        assert.equal(getZonedParts(instant, "Asia/Tokyo").date, "2026-09-21");
    });

    test("getZonedParts: meia-noite é 00:00 e nunca 24:00", () => {
        assert.equal(getZonedParts(new Date("2026-09-20T03:00:00Z"), SAO_PAULO).time, "00:00");
    });

    test("zonedTimeToUtc em São Paulo (UTC-3)", () => {
        assert.equal(zonedTimeToUtc("2026-09-25", "14:30", SAO_PAULO)?.toISOString(), "2026-09-25T17:30:00.000Z");
        assert.equal(zonedTimeToUtc("2026-09-25", "00:00", SAO_PAULO)?.toISOString(), "2026-09-25T03:00:00.000Z");
        assert.equal(zonedTimeToUtc("2026-09-25", "23:30", SAO_PAULO)?.toISOString(), "2026-09-26T02:30:00.000Z");
    });

    test("zonedTimeToUtc é o inverso de getZonedParts", () => {
        for (const tz of [SAO_PAULO, NEW_YORK, "Asia/Tokyo", "Europe/Lisbon"]) {
            const instant = zonedTimeToUtc("2026-07-15", "09:30", tz)!;
            const back = getZonedParts(instant, tz);
            assert.equal(back.date, "2026-07-15", tz);
            assert.equal(back.time, "09:30", tz);
        }
    });

    test("horário de verão: deslocamento certo antes e depois da mudança (Nova York)", () => {
        // Antes do salto (domingo 8/mar/2026): EST = UTC-5. Depois: EDT = UTC-4.
        assert.equal(zonedTimeToUtc("2026-03-07", "12:00", NEW_YORK)?.toISOString(), "2026-03-07T17:00:00.000Z");
        assert.equal(zonedTimeToUtc("2026-03-09", "12:00", NEW_YORK)?.toISOString(), "2026-03-09T16:00:00.000Z");
        // No próprio dia do salto, de manhã ainda é EST, à tarde já é EDT.
        assert.equal(zonedTimeToUtc("2026-03-08", "01:30", NEW_YORK)?.toISOString(), "2026-03-08T06:30:00.000Z");
        assert.equal(zonedTimeToUtc("2026-03-08", "03:30", NEW_YORK)?.toISOString(), "2026-03-08T07:30:00.000Z");
    });

    test("horário que não existe (pulado pelo horário de verão) devolve null", () => {
        assert.equal(zonedTimeToUtc("2026-03-08", "02:30", NEW_YORK), null);
    });

    test("fim do horário de verão (1/nov/2026): meio-dia já é EST", () => {
        assert.equal(zonedTimeToUtc("2026-10-31", "12:00", NEW_YORK)?.toISOString(), "2026-10-31T16:00:00.000Z");
        assert.equal(zonedTimeToUtc("2026-11-01", "12:00", NEW_YORK)?.toISOString(), "2026-11-01T17:00:00.000Z");
    });
});

describe("dateRange", () => {
    test("isValidDateString rejeita formato errado e datas inexistentes", () => {
        assert.equal(isValidDateString("2026-09-25"), true);
        assert.equal(isValidDateString("2028-02-29"), true);
        assert.equal(isValidDateString("2026-02-29"), false, "2026 não é bissexto");
        assert.equal(isValidDateString("2026-02-30"), false);
        assert.equal(isValidDateString("2026-13-01"), false);
        assert.equal(isValidDateString("25/09/2026"), false);
        assert.equal(isValidDateString("2026-9-5"), false);
    });

    test("addDays atravessa mês e ano", () => {
        assert.equal(addDays("2026-09-30", 1), "2026-10-01");
        assert.equal(addDays("2026-12-31", 1), "2027-01-01");
        assert.equal(addDays("2026-03-01", -1), "2026-02-28");
    });

    test("weekdayOf: 0 = domingo", () => {
        assert.equal(weekdayOf("2026-09-20"), 0);
        assert.equal(weekdayOf("2026-09-25"), 5);
    });

    test("todayInTimezone usa o dia da barbearia, não o do servidor", () => {
        const instant = new Date("2026-09-21T01:30:00Z");
        assert.equal(todayInTimezone(SAO_PAULO, instant), "2026-09-20");
        assert.equal(todayInTimezone("Asia/Tokyo", instant), "2026-09-21");
    });

    test("getDayRangeInTimezone: dia inteiro em São Paulo tem 24h", () => {
        const { start, end } = getDayRangeInTimezone("2026-09-25", SAO_PAULO);
        assert.equal(start.toISOString(), "2026-09-25T03:00:00.000Z");
        assert.equal(end.toISOString(), "2026-09-26T03:00:00.000Z");
    });

    test("getDayRangeInTimezone: dia do salto do horário de verão tem 23h", () => {
        const { start, end } = getDayRangeInTimezone("2026-03-08", NEW_YORK);
        assert.equal((end.getTime() - start.getTime()) / 3_600_000, 23);
    });
});
