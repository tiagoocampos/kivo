import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { computeAvailableSlots, SLOT_GRANULARITY_MINUTES } from "./availability.js";
import { timeToMinutes } from "./time.js";

const manha = { startTime: "09:00", endTime: "12:00" };
const tarde = { startTime: "13:00", endTime: "15:00" };

function slots(overrides: Partial<Parameters<typeof computeAvailableSlots>[0]> = {}) {
    return computeAvailableSlots({
        workingHours: [manha],
        existingAppointments: [],
        serviceDurationMinutes: 30,
        slotGranularityMinutes: SLOT_GRANULARITY_MINUTES,
        nowMinutes: null,
        ...overrides
    });
}

// Agendamento existente, escrito em "HH:mm" pra ficar legível nos testes.
function busy(start: string, end: string) {
    return { startMinutes: timeToMinutes(start), endMinutes: timeToMinutes(end) };
}

describe("computeAvailableSlots — geração de horários", () => {
    test("a granularidade padrão é de 30 minutos", () => {
        assert.equal(SLOT_GRANULARITY_MINUTES, 30);
    });

    test("expediente 09–12 com serviço de 30 min: 09:00 até 11:30", () => {
        assert.deepEqual(slots(), ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"]);
    });

    test("o serviço inteiro precisa caber antes do fim do expediente", () => {
        // 45 min: começar às 11:30 terminaria 12:15, depois do expediente.
        assert.deepEqual(slots({ serviceDurationMinutes: 45 }), ["09:00", "09:30", "10:00", "10:30", "11:00"]);
        // 60 min: último início possível é 11:00.
        assert.deepEqual(slots({ serviceDurationMinutes: 60 }), ["09:00", "09:30", "10:00", "10:30", "11:00"]);
        // 90 min: último início é 10:30.
        assert.deepEqual(slots({ serviceDurationMinutes: 90 }), ["09:00", "09:30", "10:00", "10:30"]);
    });

    test("serviço maior que o expediente inteiro não gera horário nenhum", () => {
        assert.deepEqual(slots({ serviceDurationMinutes: 240 }), []);
    });

    test("pausa de almoço (dois intervalos): nenhum horário atravessa o intervalo", () => {
        const result = slots({ workingHours: [manha, tarde], serviceDurationMinutes: 60 });
        assert.deepEqual(result, ["09:00", "09:30", "10:00", "10:30", "11:00", "13:00", "13:30", "14:00"]);
        assert.ok(!result.includes("11:30"), "11:30 + 60min invadiria o almoço");
        assert.ok(!result.includes("12:00") && !result.includes("12:30"));
    });

    test("intervalos fora de ordem saem ordenados e sem repetição", () => {
        const result = slots({ workingHours: [tarde, manha, manha] });
        assert.deepEqual(result, [...result].sort());
        assert.equal(new Set(result).size, result.length);
        assert.equal(result[0], "09:00");
    });

    test("os horários partem do início de cada intervalo (não da hora cheia)", () => {
        assert.deepEqual(slots({ workingHours: [{ startTime: "09:15", endTime: "10:45" }] }), ["09:15", "09:45", "10:15"]);
    });

    test("granularidade configurável (15 min)", () => {
        assert.deepEqual(slots({ slotGranularityMinutes: 15, workingHours: [{ startTime: "09:00", endTime: "10:00" }] }), [
            "09:00", "09:15", "09:30"
        ]);
    });

    test("sem expediente naquele dia, sem horários", () => {
        assert.deepEqual(slots({ workingHours: [] }), []);
    });

    test("entrada inválida não trava nem inventa horário", () => {
        assert.deepEqual(slots({ serviceDurationMinutes: 0 }), []);
        assert.deepEqual(slots({ serviceDurationMinutes: -30 }), []);
        assert.deepEqual(slots({ slotGranularityMinutes: 0 }), []);
    });
});

describe("computeAvailableSlots — colisão com agendamentos existentes", () => {
    test("um agendamento tira só o horário dele", () => {
        assert.deepEqual(slots({ existingAppointments: [busy("10:00", "10:30")] }), ["09:00", "09:30", "10:30", "11:00", "11:30"]);
    });

    test("agendamentos que só se encostam não colidem (termina às 10:00, outro começa às 10:00)", () => {
        const result = slots({ existingAppointments: [busy("10:00", "10:30")] });
        assert.ok(result.includes("09:30"), "09:30–10:00 termina quando o outro começa");
        assert.ok(result.includes("10:30"), "10:30 começa quando o outro termina");
    });

    test("a colisão usa a duração do serviço PEDIDO: 60 min não pode terminar dentro de um agendamento", () => {
        const result = slots({ serviceDurationMinutes: 60, existingAppointments: [busy("10:00", "10:30")] });
        assert.ok(!result.includes("09:30"), "09:30–10:30 invade o agendamento das 10:00");
        assert.ok(result.includes("09:00"), "09:00–10:00 cabe, termina justo quando o outro começa");
        assert.ok(!result.includes("10:00"));
        assert.ok(result.includes("10:30"));
    });

    test("um agendamento longo (90 min) bloqueia todos os horários dentro dele", () => {
        const result = slots({ existingAppointments: [busy("10:00", "11:30")] });
        assert.deepEqual(result, ["09:00", "09:30", "11:30"]);
    });

    test("agendamento fora da grade de 30 min bloqueia os horários que ele atravessa", () => {
        const result = slots({ existingAppointments: [busy("10:15", "10:45")] });
        assert.ok(!result.includes("10:00"), "10:00–10:30 encosta em 10:15");
        assert.ok(!result.includes("10:30"), "10:30–11:00 encosta até 10:45");
        assert.ok(result.includes("09:30") && result.includes("11:00"));
    });

    test("vários agendamentos", () => {
        const result = slots({ existingAppointments: [busy("09:00", "09:30"), busy("10:30", "11:00"), busy("11:30", "12:00")] });
        assert.deepEqual(result, ["09:30", "10:00", "11:00"]);
    });

    test("agenda cheia: nenhum horário", () => {
        assert.deepEqual(slots({ existingAppointments: [busy("09:00", "12:00")] }), []);
    });

    test("agendamento que começou antes do expediente e invade o começo dele", () => {
        // ex: agendamento das 08:30 às 09:30 (expediente começa 09:00)
        assert.deepEqual(slots({ existingAppointments: [busy("08:30", "09:30")] }).slice(0, 2), ["09:30", "10:00"]);
    });
});

describe("computeAvailableSlots — horários que já passaram (hoje)", () => {
    test("descarta o que já passou, inclusive o horário exatamente agora", () => {
        // agora = 10:00 -> 10:00 não é mais oferecido, 10:30 é.
        assert.deepEqual(slots({ nowMinutes: timeToMinutes("10:00") }), ["10:30", "11:00", "11:30"]);
    });

    test("um minuto antes do horário ele ainda é oferecido", () => {
        assert.deepEqual(slots({ nowMinutes: timeToMinutes("09:59") })[0], "10:00");
    });

    test("depois do fim do expediente não sobra nada", () => {
        assert.deepEqual(slots({ nowMinutes: timeToMinutes("18:00") }), []);
    });

    test("antes de abrir mantém tudo", () => {
        assert.equal(slots({ nowMinutes: timeToMinutes("07:00") }).length, 6);
    });

    test("nowMinutes null (dia futuro) não descarta nada", () => {
        assert.equal(slots({ nowMinutes: null }).length, 6);
    });

    test("combina 'já passou' com agendamento existente", () => {
        const result = slots({ nowMinutes: timeToMinutes("09:30"), existingAppointments: [busy("10:00", "10:30")] });
        assert.deepEqual(result, ["10:30", "11:00", "11:30"]);
    });
});
