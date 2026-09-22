import { useContext } from "react"
import { CustomerAuthContext } from "@/context/CustomerAuthContext"

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext)

  if (!context) {
    throw new Error("useCustomerAuth deve ser usado dentro de um CustomerAuthProvider")
  }

  return context
}
