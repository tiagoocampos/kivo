import { describe, expect, it } from "vitest"
import { formatBusinessHoursList, getStoreOpenStatus } from "./storeHours"
import type { BusinessHoursDay } from "@/types"

const SAO_PAULO = "America/Sao_Paulo"

// Só terça (2) aberta, das 09:00 às 18:00.
const HOURS: BusinessHoursDay[] = [
  { dayOfWeek: 1, isClosed: true, opensAt: null, closesAt: null },
  { dayOfWeek: 2, isClosed: false, opensAt: "09:00", closesAt: "18:00" },
]

describe("getStoreOpenStatus", () => {
  it("sem horário cadastrado, não afirma nada", () => {
    expect(getStoreOpenStatus(null, SAO_PAULO)).toBeNull()
    expect(getStoreOpenStatus([], SAO_PAULO)).toBeNull()
  })

  it("aberto durante o expediente (terça 12:00 em São Paulo)", () => {
    expect(getStoreOpenStatus(HOURS, SAO_PAULO, new Date("2026-09-22T15:00:00Z"))).toEqual({
      isOpen: true,
      label: "Fecha às 18:00",
    })
  })

  it("antes de abrir avisa a hora de abertura", () => {
    expect(getStoreOpenStatus(HOURS, SAO_PAULO, new Date("2026-09-22T11:00:00Z"))).toEqual({
      isOpen: false,
      label: "Abre às 09:00",
    })
  })

  it("no horário de fechar já está fechado", () => {
    expect(getStoreOpenStatus(HOURS, SAO_PAULO, new Date("2026-09-22T21:00:00Z"))?.isOpen).toBe(false)
  })

  it("dia marcado como fechado ou sem entrada", () => {
    // segunda 12:00 em São Paulo
    expect(getStoreOpenStatus(HOURS, SAO_PAULO, new Date("2026-09-21T15:00:00Z"))).toEqual({
      isOpen: false,
      label: null,
    })
  })

  it("usa o relógio da barbearia, não o do aparelho", () => {
    // 02:00 UTC de terça = 23:00 de segunda em São Paulo (fechado, sem rótulo)…
    const instant = new Date("2026-09-22T02:00:00Z")
    expect(getStoreOpenStatus(HOURS, SAO_PAULO, instant)).toEqual({ isOpen: false, label: null })
    // …mas em UTC já é terça, antes de abrir.
    expect(getStoreOpenStatus(HOURS, "UTC", instant)).toEqual({ isOpen: false, label: "Abre às 09:00" })
  })
})

describe("formatBusinessHoursList", () => {
  it("ordena por dia e marca fechado", () => {
    expect(formatBusinessHoursList([...HOURS].reverse())).toEqual(["Segunda: Fechado", "Terça: 09:00–18:00"])
    expect(formatBusinessHoursList(null)).toEqual([])
  })
})
