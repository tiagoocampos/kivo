export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

// 30 -> "30 min", 60 -> "1h", 90 -> "1h30"
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`

  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60

  return rest === 0 ? `${hours}h` : `${hours}h${String(rest).padStart(2, "0")}`
}
