// O link do Instagram vem do cadastro da barbearia. Só http(s) vira href —
// qualquer outro esquema (javascript:, data:…) é descartado.
export function getSafeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null

  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null
  } catch {
    return null
  }
}
