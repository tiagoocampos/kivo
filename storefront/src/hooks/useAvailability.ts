import { useEffect, useState } from "react"
import { getErrorStatus } from "@/services/api"
import { getAvailability } from "@/services/booking"

export type AvailabilityState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; slots: string[] }
  // O endpoint não existe/não está pronto no backend (404/501).
  | { status: "unavailable" }
  | { status: "error" }

interface UseAvailabilityParams {
  slug: string
  serviceId: string | null
  professionalId: string | null // null = qualquer profissional
  date: string | null
  // Recarrega mesmo com os mesmos parâmetros (ex: horário que acabou de ser ocupado).
  version: number
}

export function useAvailability({ slug, serviceId, professionalId, date, version }: UseAvailabilityParams) {
  const [state, setState] = useState<AvailabilityState>({ status: "idle" })
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!serviceId || !date) {
      setState({ status: "idle" })
      return
    }

    // Descarta a resposta de uma consulta antiga se o cliente já trocou de dia/serviço.
    let active = true
    setState({ status: "loading" })

    getAvailability(slug, { serviceId, date, ...(professionalId ? { professionalId } : {}) })
      .then((slots) => {
        if (active) setState({ status: "success", slots })
      })
      .catch((error: unknown) => {
        if (!active) return
        const status = getErrorStatus(error)
        setState({ status: status === 404 || status === 501 ? "unavailable" : "error" })
      })

    return () => {
      active = false
    }
  }, [slug, serviceId, professionalId, date, version, retryCount])

  return { state, retry: () => setRetryCount((current) => current + 1) }
}
