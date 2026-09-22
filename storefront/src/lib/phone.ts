// Máscara de telefone brasileiro enquanto o cliente digita.
export function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)

  if (digits.length === 0) return ""
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

// O que vai pra API: só dígitos. O backend valida 10–11 dígitos, então o front
// não depende de o backend saber limpar máscara.
export function phoneDigits(value: string): string {
  return value.replace(/\D/g, "")
}

// Mesma regra do backend (phoneSchema): DDD + 8 ou 9 dígitos.
export function isValidPhone(value: string): boolean {
  const digits = phoneDigits(value)
  return digits.length === 10 || digits.length === 11
}
