import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { BookingReview } from "@/components/BookingReview"
import type { BookingStep, ProfessionalChoice } from "@/context/BookingContext"
import type { Service } from "@/types"

interface BookingSummarySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: Service | null
  professional: ProfessionalChoice | null
  date: string | null
  time: string | null
  onEdit: (step: BookingStep) => void
}

export function BookingSummarySheet({
  open,
  onOpenChange,
  service,
  professional,
  date,
  time,
  onEdit,
}: BookingSummarySheetProps) {
  if (!service) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85svh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Seu agendamento</SheetTitle>
          <SheetDescription>Confira o que você escolheu. Toque em “Alterar” para mudar.</SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-6">
          <BookingReview
            service={service}
            professional={professional}
            date={date}
            time={time}
            onEdit={(step) => {
              onOpenChange(false)
              onEdit(step)
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
