import { api } from "@/services/api"

export interface PushSubscriptionPayload {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

// Chave pública VAPID usada pra pushManager.subscribe. Endpoint público, sem auth.
export async function getVapidPublicKey(): Promise<string> {
  const { data } = await api.get<{ publicKey: string }>("/push/vapid-public-key", {
    skipErrorToast: true,
  })
  return data.publicKey
}

// A inscrição fica ligada ao agendamento, não à conta do cliente — funciona
// também pra quem agendou como convidado, sem login.
export async function subscribeAppointmentPush(
  slug: string,
  appointmentId: string,
  subscription: PushSubscriptionPayload
): Promise<void> {
  await api.post(`/booking/${slug}/appointments/${appointmentId}/push-subscription`, subscription, {
    skipErrorToast: true,
  })
}
