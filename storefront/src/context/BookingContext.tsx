import { createContext, useCallback, useMemo, useState, type ReactNode } from "react"
import type { Professional, Service } from "@/types"

export type BookingStep = "service" | "professional" | "datetime" | "confirm"

export const BOOKING_STEPS: BookingStep[] = ["service", "professional", "datetime", "confirm"]

// Escolha "Qualquer profissional disponível": nenhum profissional específico.
export const ANY_PROFESSIONAL = "any" as const
export type ProfessionalChoice = Professional | typeof ANY_PROFESSIONAL

interface BookingSelection {
  service: Service | null
  professional: ProfessionalChoice | null
  date: string | null // "YYYY-MM-DD" no fuso da barbearia
  time: string | null // "HH:mm"
}

interface BookingContextValue extends BookingSelection {
  step: BookingStep
  // Incrementa quando o horário escolhido deixou de estar livre (ex: alguém
  // marcou antes) — quem lista disponibilidade recarrega ao ver isso mudar.
  availabilityVersion: number
  canContinue: boolean
  isStepComplete: (step: BookingStep) => boolean
  selectService: (service: Service) => void
  selectProfessional: (professional: ProfessionalChoice) => void
  selectDate: (date: string) => void
  selectTime: (time: string) => void
  goToStep: (step: BookingStep) => void
  goBack: () => void
  goNext: () => void
  // Limpa o horário escolhido sem recarregar a grade (ele saiu da lista de livres).
  clearTime: () => void
  // Limpa o horário E manda recarregar a grade (o horário foi ocupado por outra pessoa).
  invalidateTime: () => void
  reset: () => void
}

const EMPTY_SELECTION: BookingSelection = { service: null, professional: null, date: null, time: null }

function isComplete(step: BookingStep, selection: BookingSelection): boolean {
  switch (step) {
    case "service":
      return selection.service !== null
    case "professional":
      return selection.professional !== null
    case "datetime":
      return selection.date !== null && selection.time !== null
    case "confirm":
      return false
  }
}

// Primeira etapa (a partir do começo) ainda sem resposta. Depois que o cliente
// escolhe algo, ele cai direto na próxima pendência — não precisa repassar o
// que já respondeu.
function firstIncompleteStep(selection: BookingSelection): BookingStep {
  return BOOKING_STEPS.find((step) => step !== "confirm" && !isComplete(step, selection)) ?? "confirm"
}

export const BookingContext = createContext<BookingContextValue | null>(null)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<BookingSelection>(EMPTY_SELECTION)
  const [step, setStep] = useState<BookingStep>("service")
  const [availabilityVersion, setAvailabilityVersion] = useState(0)

  const isStepComplete = useCallback((target: BookingStep) => isComplete(target, selection), [selection])

  // Só dá pra ir a uma etapa se todas as anteriores já foram respondidas.
  const goToStep = useCallback(
    (target: BookingStep) => {
      const targetIndex = BOOKING_STEPS.indexOf(target)
      const reachable = BOOKING_STEPS.slice(0, targetIndex).every((previous) => isComplete(previous, selection))
      if (reachable) setStep(target)
    },
    [selection]
  )

  // Mudar uma escolha invalida só o que depende dela: o horário nunca sobrevive
  // a uma troca de serviço/profissional/dia (a grade de horários é outra), mas
  // as demais escolhas ficam.
  const selectService = useCallback((service: Service) => {
    const next = { ...selection, service, time: null }
    setSelection(next)
    setStep(firstIncompleteStep(next))
  }, [selection])

  const selectProfessional = useCallback((professional: ProfessionalChoice) => {
    const next = { ...selection, professional, time: null }
    setSelection(next)
    setStep(firstIncompleteStep(next))
  }, [selection])

  const selectDate = useCallback((date: string) => {
    setSelection((current) => (current.date === date ? current : { ...current, date, time: null }))
  }, [])

  const selectTime = useCallback((time: string) => {
    setSelection((current) => ({ ...current, time }))
  }, [])

  const clearTime = useCallback(() => {
    setSelection((current) => (current.time === null ? current : { ...current, time: null }))
  }, [])

  const invalidateTime = useCallback(() => {
    setSelection((current) => ({ ...current, time: null }))
    setAvailabilityVersion((current) => current + 1)
  }, [])

  const goBack = useCallback(() => {
    setStep((current) => BOOKING_STEPS[Math.max(0, BOOKING_STEPS.indexOf(current) - 1)] ?? current)
  }, [])

  const goNext = useCallback(() => {
    if (!isComplete(step, selection)) return
    setStep((current) => BOOKING_STEPS[Math.min(BOOKING_STEPS.length - 1, BOOKING_STEPS.indexOf(current) + 1)] ?? current)
  }, [step, selection])

  const reset = useCallback(() => {
    setSelection(EMPTY_SELECTION)
    setStep("service")
  }, [])

  const value: BookingContextValue = useMemo(
    () => ({
      ...selection,
      step,
      availabilityVersion,
      canContinue: isComplete(step, selection),
      isStepComplete,
      selectService,
      selectProfessional,
      selectDate,
      selectTime,
      goToStep,
      goBack,
      goNext,
      clearTime,
      invalidateTime,
      reset,
    }),
    [
      selection,
      step,
      availabilityVersion,
      isStepComplete,
      selectService,
      selectProfessional,
      selectDate,
      selectTime,
      goToStep,
      goBack,
      goNext,
      clearTime,
      invalidateTime,
      reset,
    ]
  )

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

export type { BookingContextValue, BookingSelection }
