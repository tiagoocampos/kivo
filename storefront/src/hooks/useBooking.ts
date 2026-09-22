import { useContext } from "react"
import { BookingContext } from "@/context/BookingContext"

export function useBooking() {
  const context = useContext(BookingContext)

  if (!context) {
    throw new Error("useBooking deve ser usado dentro de um BookingProvider")
  }

  return context
}
