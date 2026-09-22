import type { CustomerAuthResult } from "@/types"

// Chave isolada por barbearia: evita que a sessão de cliente de uma barbearia
// vaze para outra caso o mesmo navegador acesse páginas diferentes. Nome
// deliberadamente distinto de qualquer coisa de login do painel do dono.
function storageKey(slug: string): string {
  return `kirvo_customer_session:${slug}`
}

export function getCustomerSession(slug: string): CustomerAuthResult | null {
  try {
    const raw = localStorage.getItem(storageKey(slug))
    if (!raw) return null
    return JSON.parse(raw) as CustomerAuthResult
  } catch {
    return null
  }
}

export function setCustomerSession(slug: string, session: CustomerAuthResult): void {
  try {
    localStorage.setItem(storageKey(slug), JSON.stringify(session))
  } catch {
    // localStorage indisponível (modo privado, etc.) — sessão só dura a aba atual
  }
}

export function clearCustomerSession(slug: string): void {
  try {
    localStorage.removeItem(storageKey(slug))
  } catch {
    // nada a fazer
  }
}
