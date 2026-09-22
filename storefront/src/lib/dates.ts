// Datas de agenda são "dia de parede" no fuso da barbearia, representadas como
// "YYYY-MM-DD". Toda a aritmética abaixo é feita em UTC ao meio-dia (nunca no
// fuso do aparelho), pra que horário de verão ou um aparelho em outro fuso
// nunca empurrem a data um dia pra frente ou pra trás.

const DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/

function toUtcNoon(date: string): Date {
  const match = DATE_REGEX.exec(date)
  if (!match) throw new Error(`Data inválida: ${date}`)
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12))
}

function fromUtcNoon(value: Date): string {
  return value.toISOString().slice(0, 10)
}

// "Hoje" no relógio da barbearia — não no do aparelho.
export function todayInTimezone(timezone: string, now: Date = new Date()): string {
  // en-CA formata como YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}

export function addDays(date: string, days: number): string {
  const value = toUtcNoon(date)
  value.setUTCDate(value.getUTCDate() + days)
  return fromUtcNoon(value)
}

// Diferença em dias inteiros (b - a).
export function diffInDays(a: string, b: string): number {
  return Math.round((toUtcNoon(b).getTime() - toUtcNoon(a).getTime()) / 86_400_000)
}

// 0 = domingo … 6 = sábado (mesma convenção do backend e do businessHours).
export function weekdayOf(date: string): number {
  return toUtcNoon(date).getUTCDay()
}

export function dayOfMonth(date: string): number {
  return toUtcNoon(date).getUTCDate()
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

// "Sex, 26/09"
export function formatShortDate(date: string): string {
  const value = toUtcNoon(date)
  const weekday = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", weekday: "short" })
    .format(value)
    .replace(".", "")
  const dayMonth = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", day: "2-digit", month: "2-digit" }).format(value)
  return `${capitalize(weekday)}, ${dayMonth}`
}

// "sexta-feira, 26 de setembro"
export function formatLongDate(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(toUtcNoon(date))
}

// "seg", "ter"… (sem ponto)
export function formatWeekdayInitials(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", weekday: "short" })
    .format(toUtcNoon(date))
    .replace(".", "")
}

// "21 set" / "21 set – 27 set"
export function formatDayMonth(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", day: "numeric", month: "short" })
    .format(toUtcNoon(date))
    .replace(".", "")
}

// Um instante ISO (o `scheduledAt` que vem da API) exibido no relógio da barbearia.
export function getZonedParts(iso: string, timezone: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso))

  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "00"

  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` }
}

// "Sex, 26/09 · 14:30"
export function formatAppointmentDateTime(iso: string, timezone: string): string {
  const { date, time } = getZonedParts(iso, timezone)
  return `${formatShortDate(date)} · ${time}`
}

// Minutos desde a meia-noite, agora, no relógio da barbearia — e o dia da semana dela.
export function getNowInTimezone(timezone: string, now: Date = new Date()): { weekday: number; time: string } {
  const { date, time } = getZonedParts(now.toISOString(), timezone)
  return { weekday: weekdayOf(date), time }
}
