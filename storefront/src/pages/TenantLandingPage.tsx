import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AtSign, CalendarCheck, MapPin, Phone, Scissors } from "lucide-react"
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

/** Pente estilizado, desenhado à mão pra combinar com o `Scissors` do lucide
 * (a lib não tem um ícone de pente pronto) e formar o mesmo motivo
 * tesoura+pente da referência. */
function CombGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 3h11a1 1 0 0 1 1 1v2H4V3Z"
        fill="currentColor"
      />
      {[0, 2, 4, 6, 8, 10].map((offset) => (
        <rect key={offset} x={4 + offset} y="6" width="1.3" height="15" rx="0.6" fill="currentColor" />
      ))}
    </svg>
  )
}

function BarberMark() {
  return (
    <div className="relative flex h-16 w-20 items-center justify-center">
      <CombGlyph className="absolute right-1 top-0 h-11 w-11 rotate-18 text-(--landing-foreground)/90" />
      <Scissors className="absolute left-1 bottom-0 h-10 w-10 -rotate-12 text-(--landing-foreground)" strokeWidth={1.75} />
    </div>
  )
}

/** Ilustração decorativa de navalha, sangrando pela borda direita da capa —
 * equivalente livre da navalha da referência, sem depender de asset externo. */
function RazorIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g transform="rotate(-40 80 80)">
        {/* lâmina, afinando na ponta */}
        <path d="M-10 70 L120 70 L146 80 L120 90 L-10 90 Z" fill="url(#razor-blade)" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
        {/* dorso/cabo escuro */}
        <rect x="-40" y="72" width="36" height="16" rx="4" fill="#2a2015" />
        <rect x="-58" y="75" width="20" height="10" rx="3" fill="#1a1206" />
      </g>
      <defs>
        <linearGradient id="razor-blade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#faf7ef" />
          <stop offset="1" stopColor="#c9c2b2" />
        </linearGradient>
      </defs>
    </svg>
  )
}

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

  const { logoUrl } = getStoreBranding(tenant)
  const openStatus = getStoreOpenStatus(tenant.businessHours, tenant.timezone)
  const location = [tenant.address, tenant.city].filter(Boolean).join(", ")
  const instagramUrl = getSafeHttpUrl(tenant.instagramUrl)

  return (
    <div className="tenant-landing flex min-h-svh flex-col items-center bg-(--landing-bg) text-(--landing-foreground)">
      <div className="w-full max-w-md">
        {/* Capa: composição tipográfica fixa (não vem do tenant, exceto o nome no topo). */}
        <section className="relative isolate overflow-hidden bg-(--landing-bg)">
          <div className="tenant-landing-noise" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,var(--landing-bg-elevated),var(--landing-bg))]" />

          <div className="relative z-10 flex flex-col items-center gap-4 px-6 pt-10 pb-8 text-center">
            <span className="text-xs font-medium tracking-[0.3em] text-(--landing-foreground)/60 uppercase">
              {tenant.name}
            </span>

            <BarberMark />

            <div className="relative flex flex-col items-center">
              <span className="font-heading text-2xl font-extrabold tracking-tight text-(--landing-accent-strong) uppercase sm:text-3xl">
                Agende seu
              </span>

              <div className="relative mt-1">
                <span
                  aria-hidden="true"
                  className="absolute inset-0 top-3 left-1.5 font-heading text-5xl leading-none font-black tracking-tight text-(--landing-foreground)/10 uppercase select-none sm:text-6xl"
                >
                  Horário
                </span>
                <span
                  aria-hidden="true"
                  className="absolute inset-0 top-1.5 left-0.5 font-heading text-5xl leading-none font-black tracking-tight text-(--landing-foreground)/20 uppercase select-none sm:text-6xl"
                >
                  Horário
                </span>
                <h1 className="relative font-heading text-5xl leading-none font-black tracking-tight text-(--landing-foreground) uppercase sm:text-6xl">
                  Horário
                </h1>
              </div>

              <RazorIllustration className="pointer-events-none absolute -right-14 top-1/2 z-20 h-24 w-24 -translate-y-1/2 opacity-95 sm:-right-16 sm:h-28 sm:w-28" />
            </div>

            <Button
              size="lg"
              onClick={() => navigate(`/${slug}/agendar`)}
              className="mt-6 h-12 w-full max-w-xs gap-2 rounded-full bg-(--landing-accent) text-base font-semibold text-(--landing-accent-foreground) hover:bg-(--landing-accent) hover:brightness-110"
            >
              <CalendarCheck className="size-5" strokeWidth={2} />
              Agendar horário
            </Button>
          </div>
        </section>

        {/* Ficha da barbearia: mesmos dados de sempre, tom mais editorial/calmo
         * pra não competir com a tipografia pesada da capa acima. */}
        <main className="animate-in fade-in slide-in-from-bottom-3 duration-500 flex flex-col items-center gap-4 px-6 pt-8 pb-10 text-center">
          <TenantAvatar
            logoUrl={logoUrl}
            className="size-20 border-2 border-(--landing-bg-elevated) shadow-md"
            fallbackClassName="bg-(--landing-accent) text-(--landing-accent-foreground)"
          />

          <div className="flex flex-col items-center gap-2">
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

          <footer className="mt-4 pt-4">
            <span className="text-xs text-(--landing-muted)/70">
              Feito com <span className="font-semibold">KirvoAgenda</span>
            </span>
          </footer>
        </main>
      </div>
    </div>
  )
}

export function TenantLandingPage() {
  const { slug } = useParams<{ slug: string }>()

  if (!slug) return null

  return <TenantLandingContent key={slug} slug={slug} />
}
