import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatPhoneInput, isValidPhone, phoneDigits } from "@/lib/phone"
import type { LoginCustomerPayload } from "@/types"

const loginSchema = z.object({
  phone: z.string().refine(isValidPhone, "Telefone inválido — use DDD + número"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
})

interface CustomerLoginFormProps {
  onSubmit: (values: LoginCustomerPayload) => Promise<void>
}

export function CustomerLoginForm({ onSubmit }: CustomerLoginFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginCustomerPayload>({ resolver: zodResolver(loginSchema) })

  return (
    <form onSubmit={handleSubmit((values) => onSubmit({ ...values, phone: phoneDigits(values.phone) }))} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="loginPhone">Telefone</Label>
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <Input
              id="loginPhone"
              value={field.value ?? ""}
              onChange={(event) => field.onChange(formatPhoneInput(event.target.value))}
              onBlur={field.onBlur}
              placeholder="(00) 00000-0000"
            />
          )}
        />
        {errors.phone && <span className="text-xs text-destructive">{errors.phone.message}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="loginPassword">Senha</Label>
        <Input id="loginPassword" type="password" {...register("password")} placeholder="••••••" />
        {errors.password && <span className="text-xs text-destructive">{errors.password.message}</span>}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  )
}
