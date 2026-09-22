import axios, { AxiosError } from "axios"
import { toast } from "sonner"

interface ValidationErrorBody {
  error: string
  details?: { message: string; path: string }[]
}

declare module "axios" {
  interface AxiosRequestConfig {
    // Chamadas que tratam o próprio erro na tela (ex: disponibilidade, que pode
    // não existir ainda no backend) desligam o toast global.
    skipErrorToast?: boolean
  }
}

// Em desenvolvimento, sem .env, cai no backend local (porta padrão do .env.example do backend).
const baseURL = import.meta.env.VITE_BACKEND_API ?? (import.meta.env.DEV ? "http://localhost:3333" : "")

export const api = axios.create({ baseURL })

function extractErrorMessage(error: AxiosError<ValidationErrorBody>): string {
  const data = error.response?.data

  if (data?.details && data.details.length > 0) {
    return data.details[0]!.message
  }

  if (data?.error) {
    return data.error
  }

  return "Não foi possível completar a ação. Tente novamente."
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ValidationErrorBody>) => {
    if (!error.config?.skipErrorToast) {
      toast.error(extractErrorMessage(error))
    }
    return Promise.reject(error)
  }
)

export function getErrorStatus(error: unknown): number | null {
  return axios.isAxiosError(error) ? (error.response?.status ?? null) : null
}
