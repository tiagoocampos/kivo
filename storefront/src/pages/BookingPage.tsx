import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BookingHeader } from "@/components/BookingHeader"
import { BookingFooter } from "@/components/BookingFooter"
import { BookingSkeleton } from "@/components/BookingSkeleton"
import { BookingStepper } from "@/components/BookingStepper"
import { BookingReview } from "@/components/BookingReview"
import { BookingConfirmForm, type BookingConfirmValues } from "@/components/BookingConfirmForm"
import { BookingSummaryBar } from "@/components/BookingSummaryBar"
import { BookingSummarySheet } from "@/components/BookingSummarySheet"
import { ServiceList } from "@/components/ServiceList"
import { StepLabel } from "@/components/StepLabel"
import { ProfessionalPicker } from "@/components/ProfessionalPicker"
import { DatePicker } from "@/components/DatePicker"
import { TimeSlotPicker } from "@/components/TimeSlotPicker"
import { AppointmentConfirmation } from "@/components/AppointmentConfirmation"
import { NavMenuSheet } from "@/components/NavMenuSheet"
import { AccountSheet } from "@/components/AccountSheet"
import { AppointmentsSheet } from "@/components/AppointmentsSheet"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { ANY_PROFESSIONAL, BookingProvider } from "@/context/BookingContext"
import { CustomerAuthProvider } from "@/context/CustomerAuthContext"
import { useBooking } from "@/hooks/useBooking"
import { useCustomerAuth } from "@/hooks/useCustomerAuth"
import { useAvailability } from "@/hooks/useAvailability"
import { getErrorStatus } from "@/services/api"
import { createAppointment, getBooking } from "@/services/booking"
import { applyTenantManifest } from "@/lib/pwaManifest"
import { phoneDigits } from "@/lib/phone"
import type { Appointment, BookingData } from "@/types"

type LoadStatus = "loading" | "ready" | "notFound" | "error"

function BookingContent({ slug }: { slug: string }) {
  const [data, setData] = useState<BookingData | null>(null)
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading")
  const [reloadKey, setReloadKey] = useState(0)

  const [navOpen, setNavOpen] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [appointmentsOpen, setAppointmentsOpen] = useState(false)
  const [completed, setCompleted] = useState<Appointment | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const booking = useBooking()
  const { customer, isAuthenticated } = useCustomerAuth()
  const { step, service, professional, date, time } = booking

  // Só consulta horários quando o cliente está na etapa de dia/horário.
  const professionalId = professional && professional !== ANY_PROFESSIONAL ? professional.id : null
  const availability = useAvailability({
    slug,
    serviceId: service?.id ?? null,
    professionalId,
    date: step === "datetime" ? date : null,
    version: booking.availabilityVersion,
  })

  useEffect(() => {
    let active = true
    setLoadStatus("loading")

    getBooking(slug)
      .then((result) => {
        if (!active) return
        setData(result)
        setLoadStatus("ready")
      })
      .catch((error: unknown) => {
        if (!active) return
        // 404 = a barbearia não existe; qualquer outra falha (rede, 5xx) é temporária.
        setLoadStatus(getErrorStatus(error) === 404 ? "notFound" : "error")
      })

    return () => {
      active = false
    }
  }, [slug, reloadKey])

  const tenant = data?.tenant ?? null

  useEffect(() => {
    if (!tenant) return

    document.title = tenant.name
    const link = document.querySelector<HTMLLinkElement>("link[rel='icon']")
    const previous = link ? { href: link.href, type: link.type } : null

    if (link && tenant.faviconUrl) {
      link.href = tenant.faviconUrl
      link.removeAttribute("type") // o favicon da barbearia pode ser png/jpg; o padrão é svg
    }

    return () => {
      document.title = "KirvoAgenda"
      if (link && previous) {
        link.href = previous.href
        if (previous.type) link.type = previous.type
      }
    }
  }, [tenant])

  useEffect(() => {
    if (!tenant) return

    let cleanup: (() => void) | undefined
    let cancelled = false

    applyTenantManifest(tenant, slug).then((revoke) => {
      if (cancelled) {
        revoke()
      } else {
        cleanup = revoke
      }
    })

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [tenant, slug])

  // Se a grade de horários mudou e o horário escolhido saiu dela, não mantém uma escolha inválida.
  const { clearTime } = booking
  useEffect(() => {
    if (availability.state.status === "success" && time && !availability.state.slots.includes(time)) {
      clearTime()
    }
  }, [availability.state, time, clearTime])

  // Ao trocar de etapa, traz o topo do fluxo pra vista (o primeiro render não rola).
  const stepperRef = useRef<HTMLDivElement>(null)
  const previousStep = useRef(step)
  useEffect(() => {
    if (previousStep.current !== step) {
      stepperRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    previousStep.current = step
  }, [step])

  if (loadStatus === "loading") {
    return <BookingSkeleton />
  }

  if (loadStatus === "notFound") {
    return (
      <NotFoundPage
        title="Barbearia não encontrada"
        message="Verifique o link ou entre em contato com a barbearia."
      />
    )
  }

  if (loadStatus === "error" || !data || !tenant) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3 p-6 text-center">
        <h1 className="font-heading text-lg font-semibold text-foreground">Não foi possível carregar</h1>
        <p className="text-sm text-muted-foreground">Verifique sua conexão e tente novamente.</p>
        <Button onClick={() => setReloadKey((current) => current + 1)}>Tentar novamente</Button>
      </div>
    )
  }

  const openAppointments = () => {
    if (isAuthenticated) {
      setAppointmentsOpen(true)
    } else {
      setAccountOpen(true)
    }
  }

  const handleConfirm = async (values: BookingConfirmValues) => {
    if (!service || !professional || !date || !time) return

    setSubmitting(true)
    try {
      const appointment = await createAppointment(slug, {
        serviceId: service.id,
        ...(professional !== ANY_PROFESSIONAL ? { professionalId: professional.id } : {}),
        date,
        time,
        customerName: values.customerName.trim(),
        customerPhone: phoneDigits(values.customerPhone),
      })

      setCompleted(appointment)
      booking.reset()
    } catch (error) {
      // 409 = o horário foi ocupado enquanto o cliente preenchia (o toast já avisou).
      // Volta pra escolha de horário com a grade recarregada.
      if (getErrorStatus(error) === 409) {
        booking.invalidateTime()
        booking.goToStep("datetime")
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (completed) {
    return (
      <>
        <AppointmentConfirmation
          appointment={completed}
          tenant={tenant}
          slug={slug}
          isAuthenticated={isAuthenticated}
          onNewBooking={() => setCompleted(null)}
          onOpenAppointments={() => setAppointmentsOpen(true)}
        />
        <AppointmentsSheet
          open={appointmentsOpen}
          onOpenChange={setAppointmentsOpen}
          slug={slug}
          timezone={tenant.timezone}
        />
      </>
    )
  }

  return (
    <div className="flex min-h-svh flex-col pb-24">
      <BookingHeader
        tenant={tenant}
        onOpenMenu={() => setNavOpen(true)}
        onOpenAppointments={openAppointments}
      />

      <main className="flex flex-1 flex-col gap-5 p-4">
        <div ref={stepperRef} className="scroll-mt-24">
          <BookingStepper current={step} isStepComplete={booking.isStepComplete} onSelect={booking.goToStep} />
        </div>

        {step !== "service" && (
          <Button variant="ghost" size="sm" className="-mb-2 self-start" onClick={booking.goBack}>
            <ArrowLeft /> Voltar
          </Button>
        )}

        {step === "service" && (
          <ServiceList services={data.services} selectedId={service?.id ?? null} onSelect={booking.selectService} />
        )}

        {step === "professional" && (
          <ProfessionalPicker
            professionals={data.professionals}
            selected={professional}
            onSelect={booking.selectProfessional}
          />
        )}

        {step === "datetime" && (
          <>
            <DatePicker timezone={tenant.timezone} value={date} onChange={booking.selectDate} />
            <TimeSlotPicker
              date={date}
              state={availability.state}
              selectedTime={time}
              contactPhone={tenant.phone}
              onSelect={booking.selectTime}
              onRetry={availability.retry}
            />
          </>
        )}

        {step === "confirm" && service && (
          <section className="flex flex-col gap-4">
            <div>
              <StepLabel step={4} className="mb-1">
                Confirmar
              </StepLabel>
              <p className="text-sm text-fg-muted">Revise e informe seus dados.</p>
            </div>

            <BookingReview
              service={service}
              professional={professional}
              date={date}
              time={time}
              onEdit={booking.goToStep}
            />

            <BookingConfirmForm
              customer={customer}
              onSubmit={handleConfirm}
              onOpenAccount={() => setAccountOpen(true)}
            />
          </section>
        )}
      </main>

      <BookingFooter tenant={tenant} />

      <BookingSummaryBar
        step={step}
        service={service}
        date={date}
        time={time}
        canContinue={booking.canContinue}
        isSubmitting={submitting}
        onContinue={booking.goNext}
        onOpenSummary={() => setSummaryOpen(true)}
      />

      <BookingSummarySheet
        open={summaryOpen}
        onOpenChange={setSummaryOpen}
        service={service}
        professional={professional}
        date={date}
        time={time}
        onEdit={booking.goToStep}
      />

      <NavMenuSheet
        open={navOpen}
        onOpenChange={setNavOpen}
        tenant={tenant}
        onNewBooking={() => booking.goToStep("service")}
        onOpenAccount={() => setAccountOpen(true)}
        onOpenAppointments={() => setAppointmentsOpen(true)}
      />

      <AccountSheet open={accountOpen} onOpenChange={setAccountOpen} />
      <AppointmentsSheet
        open={appointmentsOpen}
        onOpenChange={setAppointmentsOpen}
        slug={slug}
        timezone={tenant.timezone}
      />
    </div>
  )
}

export function BookingPage() {
  const { slug } = useParams<{ slug: string }>()

  if (!slug) return null

  // key={slug}: trocar de barbearia zera a seleção em andamento.
  return (
    <CustomerAuthProvider key={slug} slug={slug}>
      <BookingProvider key={slug}>
        <BookingContent slug={slug} />
      </BookingProvider>
    </CustomerAuthProvider>
  )
}
