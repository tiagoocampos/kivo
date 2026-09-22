import { describe, expect, it } from "vitest"
import {
  addDays,
  diffInDays,
  formatAppointmentDateTime,
  formatLongDate,
  formatShortDate,
  getZonedParts,
  todayInTimezone,
  weekdayOf,
} from "./dates"

const SAO_PAULO = "America/Sao_Paulo"

describe("todayInTimezone", () => {
  it("usa o dia da barbearia, não o do UTC", () => {
    // 01:30 UTC do dia 21 ainda é 22:30 do dia 20 em São Paulo.
    expect(todayInTimezone(SAO_PAULO, new Date("2026-09-21T01:30:00Z"))).toBe("2026-09-20")
    expect(todayInTimezone("Asia/Tokyo", new Date("2026-09-21T01:30:00Z"))).toBe("2026-09-21")
  })
})

describe("addDays / diffInDays / weekdayOf", () => {
  it("atravessa mês, ano e ano bissexto", () => {
    expect(addDays("2026-09-30", 1)).toBe("2026-10-01")
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01")
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29")
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28")
  })

  it("não é afetada por horário de verão (dias sempre de 24h)", () => {
    // Datas em torno de mudanças de horário nos EUA/Europa.
    expect(addDays("2026-03-07", 2)).toBe("2026-03-09")
    expect(addDays("2026-10-31", 2)).toBe("2026-11-02")
    expect(diffInDays("2026-03-07", "2026-03-09")).toBe(2)
  })

  it("calcula a diferença em dias", () => {
    expect(diffInDays("2026-09-20", "2026-09-27")).toBe(7)
    expect(diffInDays("2026-09-27", "2026-09-20")).toBe(-7)
  })

  it("weekdayOf: 0 = domingo", () => {
    expect(weekdayOf("2026-09-20")).toBe(0) // domingo
    expect(weekdayOf("2026-09-25")).toBe(5) // sexta
  })
})

describe("formatação", () => {
  it("formatShortDate: 'Sex, 25/09'", () => {
    expect(formatShortDate("2026-09-25")).toBe("Sex, 25/09")
    expect(formatShortDate("2026-09-20")).toBe("Dom, 20/09")
  })

  it("formatLongDate", () => {
    expect(formatLongDate("2026-09-25")).toBe("sexta-feira, 25 de setembro")
  })
})

describe("getZonedParts", () => {
  it("converte o instante ISO pro relógio da barbearia", () => {
    expect(getZonedParts("2026-09-21T01:30:00Z", SAO_PAULO)).toEqual({ date: "2026-09-20", time: "22:30" })
    expect(getZonedParts("2026-09-21T01:30:00Z", "Asia/Tokyo")).toEqual({ date: "2026-09-21", time: "10:30" })
  })

  it("meia-noite é 00:00, nunca 24:00", () => {
    expect(getZonedParts("2026-09-20T03:00:00Z", SAO_PAULO)).toEqual({ date: "2026-09-20", time: "00:00" })
  })

  it("formatAppointmentDateTime junta dia curto e horário", () => {
    expect(formatAppointmentDateTime("2026-09-25T17:30:00Z", SAO_PAULO)).toBe("Sex, 25/09 · 14:30")
  })
})
