import { api } from "@/services/api"
import { getCustomerSession } from "@/lib/customerSession"
import type { Appointment, BookingData, CreateAppointmentPayload, GetAvailabilityParams } from "@/types"

// Quem chama trata 404 (barbearia inexistente) x falha de rede na própria tela.
export async function getBooking(slug: string): Promise<BookingData> {
  const { data } = await api.get<BookingData>(`/booking/${slug}`, { skipErrorToast: true })
  return data
}

// Horários livres ("HH:mm", no fuso da barbearia) pro serviço/profissional/dia.
// professionalId ausente = qualquer profissional. O motor de disponibilidade
// AINDA NÃO EXISTE no backend: quem chama precisa tratar 404/501 como "indisponível".
export async function getAvailability(slug: string, params: GetAvailabilityParams): Promise<string[]> {
  const { data } = await api.get<unknown>(`/booking/${slug}/availability`, {
    params,
    skipErrorToast: true,
  })

  if (!Array.isArray(data)) {
    throw new Error("Resposta de disponibilidade inválida")
  }

  return data.filter((slot): slot is string => typeof slot === "string" && /^\d{2}:\d{2}$/.test(slot))
}

export async function createAppointment(slug: string, payload: CreateAppointmentPayload): Promise<Appointment> {
  const session = getCustomerSession(slug)

  const { data } = await api.post<Appointment>(`/booking/${slug}/appointments`, payload, {
    headers: session ? { Authorization: `Bearer ${session.token}` } : undefined,
  })
  return data
}
