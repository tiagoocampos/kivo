import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AtSign, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TenantAvatar } from "@/components/TenantAvatar"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { getStoreBranding } from "@/lib/storeBranding"
import { getStoreOpenStatus } from "@/lib/storeHours"
import { getSafeHttpUrl } from "@/lib/url"
import { getErrorStatus } from "@/services/api"
import { getBooking } from "@/services/booking"
import type { Tenant } from "@/types"

type LoadStatus = "loading" | "ready" | "notFound" | "error"

function LandingSkeleton() {
  return (
    <div className="tenant-landing flex min-h-svh flex-col bg-(--landing-bg)">
      <Skeleton className="h-56 w-full rounded-none bg-white/5" />
      <div className="flex flex-col items-center gap-4 px-6 pb-10 -mt-12">
        <Skeleton className="size-24 rounded-full bg-white/10" />
        <Skeleton className="h-6 w-48 bg-white/10" />
        <Skeleton className="h-4 w-64 bg-white/10" />
        <Skeleton className="h-11 w-full max-w-xs bg-white/10" />
      </div>
    </div>
  )
}

function TenantLandingContent({ slug }: { slug: string }) {
  const navigate = useNavigate()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading")
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    setLoadStatus("loading")

    getBooking(slug)
      .then((result) => {
        if (!active) return
        setTenant(result.tenant)
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

  useEffect(() => {
    if (!tenant) return
    document.title = tenant.name
    return () => {
      document.title = "KirvoAgenda"
    }
  }, [tenant])

  if (loadStatus === "loading") {
    return <LandingSkeleton />
  }

  if (loadStatus === "notFound") {
    return (
      <NotFoundPage
        title="Barbearia não encontrada"
        message="Verifique o link ou entre em contato com a barbearia."
      />
    )
  }

  if (loadStatus === "error" || !tenant) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3 p-6 text-center">
        <h1 className="font-heading text-lg font-semibold text-foreground">Não foi possível carregar</h1>
        <p className="text-sm text-muted-foreground">Verifique sua conexão e tente novamente.</p>
        <Button onClick={() => setReloadKey((current) => current + 1)}>Tentar novamente</Button>
      </div>
    )
  }

  const { logoUrl, bannerUrl } = getStoreBranding(tenant)
  const openStatus = getStoreOpenStatus(tenant.businessHours, tenant.timezone)
  const location = [tenant.address, tenant.city].filter(Boolean).join(", ")
  const instagramUrl = getSafeHttpUrl(tenant.instagramUrl)

  return (
    <div className="tenant-landing flex min-h-svh flex-col bg-(--landing-bg) text-(--landing-foreground)">
      <div className="relative h-56 w-full shrink-0 sm:h-64">
        {bannerUrl ? (
          <img src={bannerUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-[linear-gradient(160deg,var(--landing-bg-elevated),var(--landing-bg))]" />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/10 to-(--landing-bg)" />
      </div>

      <main className="animate-in fade-in slide-in-from-bottom-3 duration-500 flex flex-1 flex-col items-center gap-5 px-6 pb-10 text-center -mt-14">
        <TenantAvatar
          logoUrl={logoUrl}
          className="relative z-10 size-28 border-4 border-(--landing-bg) shadow-lg"
          fallbackClassName="bg-(--landing-accent) text-(--landing-accent-foreground)"
        />

        <div className="flex flex-col items-center gap-2">
          <h1 className="font-heading text-2xl font-bold">{tenant.name}</h1>

          {openStatus && (
            <span
              className={
                openStatus.isOpen
                  ? "inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400"
                  : "inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-(--landing-muted)"
              }
            >
              <span
                className={
                  openStatus.isOpen
                    ? "size-1.5 rounded-full bg-emerald-400"
                    : "size-1.5 rounded-full bg-(--landing-muted)"
                }
              />
              {openStatus.isOpen ? "Aberto agora" : "Fechado agora"}
              {openStatus.label ? ` · ${openStatus.label}` : ""}
            </span>
          )}

          {tenant.description && (
            <p className="max-w-sm text-sm text-(--landing-muted)">{tenant.description}</p>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 text-sm text-(--landing-muted)">
          {location && (
            <span className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" strokeWidth={1.75} />
              {location}
            </span>
          )}

          {tenant.phone && (
            <a
              href={`tel:${tenant.phone}`}
              className="flex items-center gap-2 text-(--landing-foreground) hover:text-(--landing-accent)"
            >
              <Phone className="size-4 shrink-0" strokeWidth={1.75} />
              {tenant.phone}
            </a>
          )}

          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-(--landing-foreground) hover:text-(--landing-accent)"
            >
              <AtSign className="size-4 shrink-0" strokeWidth={1.75} />
              Instagram
            </a>
          )}
        </div>

        <Button
          size="lg"
          onClick={() => navigate(`/${slug}/agendar`)}
          className="mt-2 h-12 w-full max-w-xs rounded-full bg-(--landing-accent) text-base font-semibold text-(--landing-accent-foreground) hover:bg-(--landing-accent) hover:brightness-110"
        >
          Agendar horário
        </Button>

        <footer className="mt-auto pt-8">
          <span className="text-xs text-(--landing-muted)/70">
            Feito com <span className="font-semibold">KirvoAgenda</span>
          </span>
        </footer>
      </main>
    </div>
  )
}

export function TenantLandingPage() {
  const { slug } = useParams<{ slug: string }>()

  if (!slug) return null

  return <TenantLandingContent key={slug} slug={slug} />
}
