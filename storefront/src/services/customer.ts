import { api } from "@/services/api"
import { getCustomerSession } from "@/lib/customerSession"
import type {
  Appointment,
  Customer,
  CustomerAuthResult,
  LoginCustomerPayload,
  RegisterCustomerPayload,
} from "@/types"

function authHeaders(slug: string) {
  const session = getCustomerSession(slug)
  return session ? { Authorization: `Bearer ${session.token}` } : undefined
}

export async function registerCustomer(
  slug: string,
  payload: RegisterCustomerPayload
): Promise<CustomerAuthResult> {
  const { data } = await api.post<CustomerAuthResult>(`/booking/${slug}/customer/register`, payload)
  return data
}

export async function loginCustomer(
  slug: string,
  payload: LoginCustomerPayload
): Promise<CustomerAuthResult> {
  const { data } = await api.post<CustomerAuthResult>(`/booking/${slug}/customer/login`, payload)
  return data
}

export async function getCustomerMe(slug: string): Promise<Customer> {
  const { data } = await api.get<Customer>(`/booking/${slug}/customer/me`, {
    headers: authHeaders(slug),
  })
  return data
}

export async function listCustomerAppointments(slug: string): Promise<Appointment[]> {
  const { data } = await api.get<Appointment[]>(`/booking/${slug}/customer/appointments`, {
    headers: authHeaders(slug),
  })
  return data
}

export async function cancelCustomerAppointment(
  slug: string,
  appointmentId: string,
  reason: string
): Promise<Appointment> {
  const { data } = await api.patch<Appointment>(
    `/booking/${slug}/customer/appointments/${appointmentId}/cancel`,
    { reason },
    { headers: authHeaders(slug) }
  )
  return data
}
