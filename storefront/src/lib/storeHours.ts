import { getNowInTimezone } from "@/lib/dates"
import type { BusinessHoursDay } from "@/types"

const DAY_LABELS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

export interface StoreOpenStatus {
  isOpen: boolean
  label: string | null
}

// "Agora" é o relógio da barbearia, não o do aparelho do cliente — quem abre o
// link de outro fuso não pode ver "Fechado" com a barbearia aberta.
export function getStoreOpenStatus(
  businessHours: BusinessHoursDay[] | null,
  timezone: string,
  now: Date = new Date()
): StoreOpenStatus | null {
  if (!businessHours || businessHours.length === 0) return null

  const { weekday, time } = getNowInTimezone(timezone, now)
  const today = businessHours.find((day) => day.dayOfWeek === weekday)
  if (!today || today.isClosed || !today.opensAt || !today.closesAt) {
    return { isOpen: false, label: null }
  }

  if (time < today.opensAt) {
    return { isOpen: false, label: `Abre às ${today.opensAt}` }
  }

  if (time >= today.closesAt) {
    return { isOpen: false, label: null }
  }

  return { isOpen: true, label: `Fecha às ${today.closesAt}` }
}

export function formatBusinessHoursList(businessHours: BusinessHoursDay[] | null): string[] {
  if (!businessHours || businessHours.length === 0) return []

  return [...businessHours]
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
    .map((day) => {
      const label = DAY_LABELS[day.dayOfWeek] ?? ""
      if (day.isClosed || !day.opensAt || !day.closesAt) {
        return `${label}: Fechado`
      }
      return `${label}: ${day.opensAt}–${day.closesAt}`
    })
}
