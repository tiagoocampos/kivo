import { test } from "node:test";
import assert from "node:assert/strict";
import { setWorkingHoursSchema, updateProfessionalSchema } from "./professionalSchema.js";

const id = "3f2b8c1e-5d4a-4b6e-9a7c-1d2e3f4a5b6c";

function parseHours(intervals: unknown[]) {
    return setWorkingHoursSchema.safeParse({ params: { id }, body: { intervals } });
}

test("aceita expediente com pausa de almoço (dois intervalos no mesmo dia)", () => {
    const result = parseHours([
        { dayOfWeek: 2, startTime: "09:00", endTime: "12:00" },
        { dayOfWeek: 2, startTime: "13:00", endTime: "18:00" },
    ]);
    assert.ok(result.success);
});

test("aceita intervalos que se encostam (12:00 termina, 12:00 começa)", () => {
    const result = parseHours([
        { dayOfWeek: 1, startTime: "09:00", endTime: "12:00" },
        { dayOfWeek: 1, startTime: "12:00", endTime: "18:00" },
    ]);
    assert.ok(result.success);
});

test("aceita lista vazia (profissional sem expediente)", () => {
    assert.ok(parseHours([]).success);
});

test("rejeita intervalos sobrepostos no mesmo dia", () => {
    const result = parseHours([
        { dayOfWeek: 3, startTime: "09:00", endTime: "13:00" },
        { dayOfWeek: 3, startTime: "12:00", endTime: "18:00" },
    ]);
    assert.ok(!result.success);
});

test("mesma faixa em dias diferentes não é sobreposição", () => {
    const result = parseHours([
        { dayOfWeek: 3, startTime: "09:00", endTime: "18:00" },
        { dayOfWeek: 4, startTime: "09:00", endTime: "18:00" },
    ]);
    assert.ok(result.success);
});

test("rejeita início igual ou posterior ao término", () => {
    assert.ok(!parseHours([{ dayOfWeek: 1, startTime: "18:00", endTime: "09:00" }]).success);
    assert.ok(!parseHours([{ dayOfWeek: 1, startTime: "09:00", endTime: "09:00" }]).success);
});

test("rejeita horário malformado e dia da semana fora de 0-6", () => {
    assert.ok(!parseHours([{ dayOfWeek: 1, startTime: "9:00", endTime: "18:00" }]).success);
    assert.ok(!parseHours([{ dayOfWeek: 1, startTime: "09:00", endTime: "24:00" }]).success);
    assert.ok(!parseHours([{ dayOfWeek: 7, startTime: "09:00", endTime: "18:00" }]).success);
});

test("isActive aceita boolean e as strings do multipart", () => {
    const parse = (isActive: unknown) => updateProfessionalSchema.safeParse({ params: { id }, body: { isActive } });
    assert.ok(parse(true).success);
    assert.ok(parse("false").success);
    assert.ok(!parse("talvez").success);
});
