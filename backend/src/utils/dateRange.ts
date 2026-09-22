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

// "YYYY-MM" do mês civil (fuso da barbearia) `monthsAgo` meses antes do mês
// atual (0 = mês atual, 1 = mês anterior). Usado pelo dashboard pra comparar
// mês atual x anterior sem depender do fuso do servidor.
export function getMonthKeyInTimezone(timezone: string, monthsAgo: number, now: Date = new Date()): string {
    const [year, month] = todayInTimezone(timezone, now).split("-").map(Number);
    const totalMonths = year! * 12 + (month! - 1) - monthsAgo;
    const normalizedYear = Math.floor(totalMonths / 12);
    const normalizedMonth = ((totalMonths % 12) + 12) % 12;

    return `${normalizedYear}-${String(normalizedMonth + 1).padStart(2, "0")}`;
}

// Intervalo UTC [start, end) exato de um mês civil no fuso, a partir de "YYYY-MM".
export function getMonthRangeInTimezone(monthKey: string, timezone: string): { start: Date; end: Date } {
    const [year, month] = monthKey.split("-").map(Number);
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const nextMonth = month === 12 ? 1 : month! + 1;
    const nextYear = month === 12 ? year! + 1 : year;
    const nextMonthStart = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

    const { start } = getDayRangeInTimezone(startDate, timezone);
    const { start: end } = getDayRangeInTimezone(nextMonthStart, timezone);

    return { start, end };
}
