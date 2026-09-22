// A agenda é "horário de parede" no fuso de cada barbearia (Tenant.timezone, IANA),
// mas o servidor roda em qualquer fuso (UTC em produção) e o banco guarda
// instantes UTC. Toda conversão entre os dois passa por aqui — nunca depende do
// fuso do processo. Diferente do Alô Delivery (Brasília fixo, UTC-3), o fuso aqui é
// configurável por tenant e, se o país tiver horário de verão, é tratado.

const formatters = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timezone: string): Intl.DateTimeFormat {
    let formatter = formatters.get(timezone);

    if (!formatter) {
        formatter = new Intl.DateTimeFormat("en-CA", {
            timeZone: timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hourCycle: "h23"
        });
        formatters.set(timezone, formatter);
    }

    return formatter;
}

export function isValidTimezone(timezone: string): boolean {
    try {
        new Intl.DateTimeFormat("en-CA", { timeZone: timezone });
        return true;
    } catch {
        return false;
    }
}

export interface ZonedParts {
    date: string; // "YYYY-MM-DD"
    time: string; // "HH:mm"
    minutes: number; // minutos desde a meia-noite local
    seconds: number; // segundos dentro do minuto
}

// Um instante visto no relógio de parede do fuso.
export function getZonedParts(instant: Date, timezone: string): ZonedParts {
    const parts = getFormatter(timezone).formatToParts(instant);
    const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";

    const hour = Number(get("hour"));
    const minute = Number(get("minute"));

    return {
        date: `${get("year")}-${get("month")}-${get("day")}`,
        time: `${get("hour")}:${get("minute")}`,
        minutes: hour * 60 + minute,
        seconds: Number(get("second"))
    };
}

// Diferença (ms) entre o relógio de parede do fuso e o UTC naquele instante.
function getOffsetMs(instant: Date, timezone: string): number {
    const parts = getZonedParts(instant, timezone);
    const [year, month, day] = parts.date.split("-").map(Number);
    const wallAsUtc = Date.UTC(year!, month! - 1, day!, Math.floor(parts.minutes / 60), parts.minutes % 60, parts.seconds);
    const instantSeconds = Math.floor(instant.getTime() / 1000) * 1000;

    return wallAsUtc - instantSeconds;
}

// "2026-09-25" + "14:30" no fuso da barbearia -> o instante UTC exato.
// Devolve null se esse horário não existe naquele dia (salto do horário de verão,
// ex: 02:30 na noite em que o relógio pula de 02:00 pra 03:00).
export function zonedTimeToUtc(date: string, time: string, timezone: string): Date | null {
    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);
    const naive = Date.UTC(year!, month! - 1, day!, hour!, minute!);

    // Duas passadas: o deslocamento do fuso pode ser outro no instante já corrigido
    // (é o que acontece em volta de uma mudança de horário de verão).
    let utc = naive - getOffsetMs(new Date(naive), timezone);
    utc = naive - getOffsetMs(new Date(utc), timezone);

    const result = new Date(utc);
    const roundTrip = getZonedParts(result, timezone);

    return roundTrip.date === date && roundTrip.time === time ? result : null;
}
