import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Phone, User } from "lucide-react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatPhoneInput, isValidPhone } from "@/lib/phone"
import type { Customer } from "@/types"

const confirmSchema = z.object({
  customerName: z.string().trim().min(1, "O nome é obrigatório"),
  customerPhone: z.string().refine(isValidPhone, "Telefone inválido — use DDD + número"),
})

export type BookingConfirmValues = z.infer<typeof confirmSchema>

interface BookingConfirmFormProps {
  // Cliente logado: os dados vêm da conta, sem campos pra preencher.
  customer: Customer | null
  onSubmit: (values: BookingConfirmValues) => void
  onOpenAccount: () => void
}

// O botão "Confirmar agendamento" fica na barra fixa inferior e envia este
// formulário pelo id — por isso não há botão de submit aqui dentro.
export function BookingConfirmForm({ customer, onSubmit, onOpenAccount }: BookingConfirmFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingConfirmValues>({
    resolver: zodResolver(confirmSchema),
    defaultValues: customer
      ? { customerName: customer.name, customerPhone: customer.phone }
      : { customerName: "", customerPhone: "" },
  })

  if (customer) {
    // Sem campos na tela, uma validação que falhasse seria silenciosa: envia os
    // dados da conta direto (o backend valida do lado dele).
    const submitAsCustomer = (event: React.FormEvent) => {
      event.preventDefault()
      onSubmit({ customerName: customer.name, customerPhone: customer.phone })
    }

    return (
      <form id="booking-confirm-form" onSubmit={submitAsCustomer} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5 rounded-xl border border-border p-3">
          <span className="text-xs text-muted-foreground">Agendando como</span>
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <User className="size-4 text-muted-foreground" />
            {customer.name}
          </span>
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="size-4" />
            {formatPhoneInput(customer.phone)}
          </span>
        </div>
      </form>
    )
  }

  return (
    <form id="booking-confirm-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="customerName">Nome</Label>
        <Input id="customerName" autoComplete="name" {...register("customerName")} placeholder="Seu nome" />
        {errors.customerName && <span className="text-xs text-destructive">{errors.customerName.message}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="customerPhone">Telefone (WhatsApp)</Label>
        <Controller
          control={control}
          name="customerPhone"
          render={({ field }) => (
            <Input
              id="customerPhone"
              type="tel"
              autoComplete="tel-national"
              inputMode="tel"
              value={field.value ?? ""}
              onChange={(event) => field.onChange(formatPhoneInput(event.target.value))}
              onBlur={field.onBlur}
              placeholder="(00) 00000-0000"
            />
          )}
        />
        {errors.customerPhone && <span className="text-xs text-destructive">{errors.customerPhone.message}</span>}
      </div>

      <p className="text-xs text-muted-foreground">
        Quer acompanhar e cancelar seus agendamentos?{" "}
        <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={onOpenAccount}>
          Entre ou crie uma conta
        </Button>
        . É opcional.
      </p>
    </form>
  )
}
