import { createContext, useState, type ReactNode } from "react"
import { clearCustomerSession, getCustomerSession, setCustomerSession } from "@/lib/customerSession"
import { loginCustomer, registerCustomer } from "@/services/customer"
import type { Customer, LoginCustomerPayload, RegisterCustomerPayload } from "@/types"

interface CustomerAuthContextValue {
  customer: Customer | null
  isAuthenticated: boolean
  login: (payload: LoginCustomerPayload) => Promise<void>
  register: (payload: RegisterCustomerPayload) => Promise<void>
  logout: () => void
}

export const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null)

export function CustomerAuthProvider({ slug, children }: { slug: string; children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(() => getCustomerSession(slug)?.customer ?? null)

  const login = async (payload: LoginCustomerPayload) => {
    const result = await loginCustomer(slug, payload)
    setCustomerSession(slug, result)
    setCustomer(result.customer)
  }

  const register = async (payload: RegisterCustomerPayload) => {
    const result = await registerCustomer(slug, payload)
    setCustomerSession(slug, result)
    setCustomer(result.customer)
  }

  const logout = () => {
    clearCustomerSession(slug)
    setCustomer(null)
  }

  return (
    <CustomerAuthContext.Provider value={{ customer, isAuthenticated: Boolean(customer), login, register, logout }}>
      {children}
    </CustomerAuthContext.Provider>
  )
}
