import { CalendarPlus, Download, ListOrdered, LogIn, Moon, Phone, Sun, User } from "lucide-react"
import { useTheme } from "next-themes"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { TenantAvatar } from "@/components/TenantAvatar"
import { getStoreBranding } from "@/lib/storeBranding"
import { useCustomerAuth } from "@/hooks/useCustomerAuth"
import { useInstallPrompt } from "@/hooks/useInstallPrompt"
import type { Tenant } from "@/types"

interface NavMenuSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenant: Tenant
  onNewBooking: () => void
  onOpenAccount: () => void
  onOpenAppointments: () => void
}

export function NavMenuSheet({
  open,
  onOpenChange,
  tenant,
  onNewBooking,
  onOpenAccount,
  onOpenAppointments,
}: NavMenuSheetProps) {
  const { isAuthenticated } = useCustomerAuth()
  const { canInstall, promptInstall } = useInstallPrompt()
  const { resolvedTheme, setTheme } = useTheme()
  const close = () => onOpenChange(false)
  const { logoUrl, bannerUrl } = getStoreBranding(tenant)
  const hasBanner = Boolean(bannerUrl)
  const isDark = resolvedTheme === "dark"

  const itemClass =
    "flex items-center gap-3 px-4 py-2.5 text-sm text-brand-foreground/90 transition-colors hover:bg-brand-foreground/10"

  const titleRow = (
    <SheetHeader
      className={
        hasBanner
          ? "flex-row items-center gap-2.5 px-4 py-3"
          : "flex-row items-center gap-2.5 border-b border-brand-foreground/10 px-4 py-3"
      }
    >
      <TenantAvatar
        logoUrl={logoUrl}
        className="size-8 ring-2 ring-white/30"
        fallbackClassName="bg-brand-foreground/15 text-brand-foreground"
      />
      <SheetTitle
        className={hasBanner ? "text-sm font-semibold text-white" : "text-sm font-semibold text-brand-foreground"}
      >
        {tenant.name}
      </SheetTitle>
      <SheetDescription className="sr-only">Menu da barbearia</SheetDescription>
    </SheetHeader>
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="flex w-full flex-col border-none bg-brand text-brand-foreground sm:max-w-xs"
      >
        {hasBanner ? (
          <div className="relative w-full border-b border-brand-foreground/10">
            <img src={bannerUrl!} alt="" className="h-28 w-full object-cover" />
            <div className="absolute inset-x-0 top-0 bg-linear-to-b from-black/60 to-transparent">{titleRow}</div>
          </div>
        ) : (
          titleRow
        )}

        <nav className="flex flex-1 flex-col py-1">
          <button
            type="button"
            onClick={() => {
              close()
              onNewBooking()
            }}
            className={itemClass}
          >
            <CalendarPlus className="size-4.5" strokeWidth={1.75} />
            Agendar horário
          </button>

          {canInstall && (
            <button type="button" onClick={promptInstall} className={itemClass}>
              <Download className="size-4.5" strokeWidth={1.75} />
              Instalar app
            </button>
          )}

          <Separator className="my-1 bg-brand-foreground/10" />

          <button
            type="button"
            onClick={() => {
              close()
              onOpenAccount()
            }}
            className={itemClass}
          >
            {isAuthenticated ? (
              <User className="size-4.5" strokeWidth={1.75} />
            ) : (
              <LogIn className="size-4.5" strokeWidth={1.75} />
            )}
            {isAuthenticated ? "Minha conta" : "Entrar / Criar conta"}
          </button>

          {isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                close()
                onOpenAppointments()
              }}
              className={itemClass}
            >
              <ListOrdered className="size-4.5" strokeWidth={1.75} />
              Meus agendamentos
            </button>
          )}

          <Separator className="my-1 bg-brand-foreground/10" />

          <button type="button" onClick={() => setTheme(isDark ? "light" : "dark")} className={itemClass}>
            {isDark ? <Sun className="size-4.5" strokeWidth={1.75} /> : <Moon className="size-4.5" strokeWidth={1.75} />}
            {isDark ? "Tema claro" : "Tema escuro"}
          </button>

          {tenant.phone && (
            <>
              <Separator className="my-1 bg-brand-foreground/10" />
              <a href={`tel:${tenant.phone}`} className={itemClass}>
                <Phone className="size-4.5" strokeWidth={1.75} />
                {tenant.phone}
              </a>
            </>
          )}
        </nav>

        <p className="border-t border-brand-foreground/10 px-4 py-2.5 text-center text-[11px] text-brand-foreground/50">
          Agendamento por KirvoAgenda
        </p>
      </SheetContent>
    </Sheet>
  )
}
