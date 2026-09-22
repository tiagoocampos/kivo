import { useState } from "react"
import { toast } from "sonner"
import { LogOut, Mail, Phone, User } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CustomerLoginForm } from "@/components/CustomerLoginForm"
import { CustomerRegisterForm } from "@/components/CustomerRegisterForm"
import { formatPhoneInput } from "@/lib/phone"
import { cn } from "@/lib/utils"
import { useCustomerAuth } from "@/hooks/useCustomerAuth"

interface AccountSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AccountSheet({ open, onOpenChange }: AccountSheetProps) {
  const { customer, isAuthenticated, login, register, logout } = useCustomerAuth()
  const [authMode, setAuthMode] = useState<"login" | "register">("login")

  const handleLogin = async (values: { phone: string; password: string }) => {
    try {
      await login(values)
      toast.success("Login realizado")
    } catch {
      // toast de erro já disparado pelo interceptor do axios
    }
  }

  const handleRegister = async (values: { name: string; phone: string; email?: string; password: string }) => {
    try {
      await register(values)
      toast.success("Conta criada com sucesso")
    } catch {
      // toast de erro já disparado pelo interceptor do axios
    }
  }

  const tabClass = (active: boolean) =>
    cn(
      "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
      active ? "border-primary bg-accent text-accent-foreground" : "border-border text-foreground hover:bg-muted"
    )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isAuthenticated ? "Minha conta" : "Entrar ou criar conta"}</SheetTitle>
          <SheetDescription className="sr-only">
            {isAuthenticated ? "Dados da sua conta nesta barbearia" : "Acesse ou crie sua conta nesta barbearia"}
          </SheetDescription>
        </SheetHeader>

        {!isAuthenticated ? (
          <div className="flex flex-col gap-4 px-4 pb-4">
            <div className="flex gap-2">
              <button type="button" onClick={() => setAuthMode("login")} className={tabClass(authMode === "login")}>
                Já tenho conta
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className={tabClass(authMode === "register")}
              >
                Criar conta
              </button>
            </div>

            {authMode === "login" ? (
              <CustomerLoginForm onSubmit={handleLogin} />
            ) : (
              <CustomerRegisterForm onSubmit={handleRegister} />
            )}

            <p className="text-center text-xs text-muted-foreground">
              Ter uma conta é opcional — você pode agendar como convidado.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5 px-4 pb-4">
            <div className="flex flex-col gap-1.5 rounded-xl border border-border p-3">
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <User className="size-4 text-muted-foreground" />
                {customer?.name}
              </span>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="size-4" />
                {customer ? formatPhoneInput(customer.phone) : ""}
              </span>
              {customer?.email && (
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="size-4" />
                  {customer.email}
                </span>
              )}
            </div>

            <Separator />

            <Button variant="outline" onClick={logout} className="w-full">
              <LogOut /> Sair da conta
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
