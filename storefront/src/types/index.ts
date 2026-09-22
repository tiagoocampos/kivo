export interface BusinessHoursDay {
  dayOfWeek: number
  isClosed: boolean
  opensAt: string | null
  closesAt: string | null
}

export interface Tenant {
  id: string
  name: string
  slug: string
  phone: string | null
  description: string | null
  address: string | null
  city: string | null
  instagramUrl: string | null
  logoUrl: string | null
  bannerUrl: string | null
  faviconUrl: string | null
  // Fuso da barbearia (IANA, ex: "America/Sao_Paulo"). Datas e horários da
  // agenda são sempre do relógio da barbearia, não do aparelho do cliente.
  timezone: string
  businessHours: BusinessHoursDay[] | null
}

export interface Service {
  id: string
  name: string
  description: string | null
  durationMinutes: number
  price: number // centavos
}

export interface Professional {
  id: string
  name: string
  photoUrl: string | null
}

// GET /booking/:slug
export interface BookingData {
  tenant: Tenant
  services: Service[]
  professionals: Professional[]
}

export type AppointmentStatus = "agendado" | "confirmado" | "concluido" | "cancelado" | "nao_compareceu"

export type CanceledBy = "customer" | "store"

export interface Appointment {
  id: string
  status: AppointmentStatus
  scheduledAt: string // ISO 8601 (instante UTC)
  endsAt: string
  price: number // centavos, travado no momento da marcação
  customerName: string
  customerPhone: string
  cancelReason: string | null
  canceledBy: CanceledBy | null
  createdAt: string
  service: { id: string; name: string; durationMinutes: number }
  professional: { id: string; name: string; photoUrl: string | null }
}

// POST /booking/:slug/appointments
export interface CreateAppointmentPayload {
  serviceId: string
  // Ausente = "qualquer profissional disponível": o backend escolhe quem estiver livre no horário.
  professionalId?: string
  date: string // "YYYY-MM-DD", dia no fuso da barbearia
  time: string // "HH:mm", horário no fuso da barbearia
  customerName: string
  customerPhone: string // só dígitos
}

export interface GetAvailabilityParams {
  serviceId: string
  professionalId?: string
  date: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  email: string | null
}

export interface CustomerAuthResult {
  token: string
  customer: Customer
}

export interface RegisterCustomerPayload {
  name: string
  phone: string
  email?: string
  password: string
}

export interface LoginCustomerPayload {
  phone: string
  password: string
}
