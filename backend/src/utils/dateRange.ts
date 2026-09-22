import { getZonedParts, zonedTimeToUtc } from "./timezone.js";

// Dia civil = "YYYY-MM-DD" no fuso da barbearia. A aritmética de dias é feita
// em UTC ao meio-dia, pra nunca ser empurrada pelo fuso do servidor nem por
// horário de verão.

const DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

function toUtcNoon(date: string): Date {
    const match = DATE_REGEX.exec(date);
    if (!match) throw new Error(`Data inválida: ${date}`);

    return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12));
}

// Rejeita formato errado E datas que não existem no calendário (2026-02-30).
export function isValidDateString(value: string): boolean {
    const match = DATE_REGEX.exec(value);
    if (!match) return false;

    const parsed = toUtcNoon(value);
    return parsed.toISOString().slice(0, 10) === value;
}

export function addDays(date: string, days: number): string {
    const value = toUtcNoon(date);
    value.setUTCDate(value.getUTCDate() + days);

    return value.toISOString().slice(0, 10);
}

// 0 = domingo … 6 = sábado (mesma convenção de WorkingHours.dayOfWeek).
export function weekdayOf(date: string): number {
    return toUtcNoon(date).getUTCDay();
}

// "Hoje" no relógio da barbearia, não no do servidor.
export function todayInTimezone(timezone: string, now: Date = new Date()): string {
    return getZonedParts(now, timezone).date;
}

// Intervalo UTC [start, end) exato de um dia civil no fuso: da meia-noite local
// até a meia-noite local seguinte. (Em fusos cujo horário de verão pula a meia-noite,
// usa 01:00 como início do dia.)
export function getDayRangeInTimezone(date: string, timezone: string): { start: Date; end: Date } {
    const startOf = (day: string) =>
        zonedTimeToUtc(day, "00:00", timezone) ?? zonedTimeToUtc(day, "01:00", timezone);

    const start = startOf(date);
    const end = startOf(addDays(date, 1));

    if (!start || !end) {
        throw new Error(`Não foi possível calcular o dia ${date} em ${timezone}`);
    }

    return { start, end };
}
