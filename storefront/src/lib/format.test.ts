import { describe, expect, it } from "vitest"
import { formatPhoneInput, isValidPhone, phoneDigits } from "./phone"
import { formatCents, formatDuration } from "./money"
import { getSafeHttpUrl } from "./url"
import { canCustomerCancel, isUpcomingStatus } from "./appointmentStatus"

describe("telefone", () => {
  it("aplica a máscara enquanto digita", () => {
    expect(formatPhoneInput("")).toBe("")
    expect(formatPhoneInput("5")).toBe("(5")
    expect(formatPhoneInput("54999")).toBe("(54) 999")
    expect(formatPhoneInput("5499906741")).toBe("(54) 9990-6741")
    expect(formatPhoneInput("54999067417")).toBe("(54) 99906-7417")
    expect(formatPhoneInput("549990674179999")).toBe("(54) 99906-7417")
  })

  it("phoneDigits manda só números pra API", () => {
    expect(phoneDigits("(54) 99906-7417")).toBe("54999067417")
  })

  it("isValidPhone segue o backend: 10 ou 11 dígitos", () => {
    expect(isValidPhone("(54) 99906-7417")).toBe(true)
    expect(isValidPhone("(54) 3333-4444")).toBe(true)
    expect(isValidPhone("(54) 9990")).toBe(false)
    expect(isValidPhone("")).toBe(false)
  })
})

describe("dinheiro e duração", () => {
  it("formatCents sempre em reais", () => {
    // O Intl separa "R$" do valor com espaço não-quebrável; normaliza pra comparar.
    expect(formatCents(4500).replace(/\s/g, " ")).toBe("R$ 45,00")
    expect(formatCents(0).replace(/\s/g, " ")).toBe("R$ 0,00")
  })

  it("formatDuration", () => {
    expect(formatDuration(30)).toBe("30 min")
    expect(formatDuration(60)).toBe("1h")
    expect(formatDuration(90)).toBe("1h30")
    expect(formatDuration(125)).toBe("2h05")
  })
})

describe("getSafeHttpUrl", () => {
  it("aceita só http(s)", () => {
    expect(getSafeHttpUrl("https://instagram.com/barbearia")).toBe("https://instagram.com/barbearia")
    expect(getSafeHttpUrl("javascript:alert(1)")).toBeNull()
    expect(getSafeHttpUrl("data:text/html,x")).toBeNull()
    expect(getSafeHttpUrl("nao é url")).toBeNull()
    expect(getSafeHttpUrl(null)).toBeNull()
  })
})

describe("status do agendamento", () => {
  it("só 'agendado' pode ser cancelado pelo cliente", () => {
    expect(canCustomerCancel({ status: "agendado" })).toBe(true)
    for (const status of ["confirmado", "concluido", "cancelado", "nao_compareceu"] as const) {
      expect(canCustomerCancel({ status })).toBe(false)
    }
  })

  it("agendado e confirmado são 'próximos'", () => {
    expect(isUpcomingStatus("agendado")).toBe(true)
    expect(isUpcomingStatus("confirmado")).toBe(true)
    expect(isUpcomingStatus("concluido")).toBe(false)
  })
})
