import { CalendarDays, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/ThemeToggle"
import { TenantAvatar } from "@/components/TenantAvatar"
import { getStoreOpenStatus } from "@/lib/storeHours"
import { getStoreBranding } from "@/lib/storeBranding"
import type { Tenant } from "@/types"

interface BookingHeaderProps {
  tenant: Tenant
  onOpenMenu: () => void
  onOpenAppointments: () => void
}

export function BookingHeader({ tenant, onOpenMenu, onOpenAppointments }: BookingHeaderProps) {
  const { logoUrl, bannerUrl } = getStoreBranding(tenant)
  const hasBanner = Boolean(bannerUrl)

  // Sobre banner (foto) o texto precisa ser branco com degradê; sem banner, usa a cor de marca.
  const buttonClass = hasBanner
    ? "text-white hover:bg-white/10 hover:text-white"
    : "text-brand-foreground hover:bg-brand-foreground/10 hover:text-brand-foreground"

  const iconBar = (
    <div
      className={
        hasBanner
          ? "flex items-center justify-between gap-2 bg-linear-to-b from-black/60 to-transparent px-2 py-2.5 text-white"
          : "flex items-center justify-between gap-2 bg-brand px-2 py-2.5 text-brand-foreground"
      }
    >
      <Button variant="ghost" size="icon" onClick={onOpenMenu} aria-label="Abrir menu" className={buttonClass}>
        <Menu />
      </Button>

      <div className="flex min-w-0 items-center gap-2">
        <TenantAvatar
          logoUrl={logoUrl}
          className="size-7"
          fallbackClassName="bg-brand-foreground/15 text-brand-foreground"
        />
        <span className="truncate font-heading text-sm font-semibold uppercase tracking-wide">{tenant.name}</span>
      </div>

      <div className="flex items-center gap-0.5">
        <ThemeToggle className={buttonClass} />
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenAppointments}
          aria-label="Meus agendamentos"
          className={buttonClass}
        >
          <CalendarDays />
        </Button>
      </div>
    </div>
  )

  const openStatus = getStoreOpenStatus(tenant.businessHours, tenant.timezone)
  const location = [tenant.address, tenant.city].filter(Boolean).join(", ")

  const infoBar = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
      {openStatus && (
        <span className="flex items-center gap-1.5">
          <Badge
            variant={openStatus.isOpen ? "default" : "secondary"}
            className={openStatus.isOpen ? "bg-emerald-600 text-white" : undefined}
          >
            {openStatus.isOpen ? "Aberto agora" : "Fechado"}
          </Badge>
          {openStatus.label && <span>{openStatus.label}</span>}
        </span>
      )}
      {tenant.phone && <span>{tenant.phone}</span>}
      {location && <span className="truncate">{location}</span>}
    </div>
  )

  if (hasBanner) {
    return (
      <header>
        <div className="relative w-full">
          <img src={bannerUrl!} alt="" className="h-48 w-full object-cover sm:h-56" />
          <div className="absolute inset-x-0 top-0">{iconBar}</div>
        </div>
        {infoBar}
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-40">
      {iconBar}
      {infoBar}
    </header>
  )
}
