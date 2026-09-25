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

function LandingSkeleton() {
  return (
    <div data-tone="dark" className="flex min-h-svh flex-col items-center bg-surface">
      <div className="flex w-full max-w-md flex-col items-center gap-4 px-6 pt-14 pb-10">
        <Skeleton className="size-16 rounded-md bg-fg/10" />
        <Skeleton className="size-24 rounded-full bg-fg/10" />
        <Skeleton className="h-6 w-48 bg-fg/10" />
        <Skeleton className="h-4 w-64 bg-fg/10" />
        <Skeleton className="h-11 w-full max-w-xs bg-fg/10" />
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
    <div data-tone="dark" className="flex min-h-svh flex-col items-center bg-surface text-fg">
      <div className="w-full max-w-md">
        {/* Capa: moldura neutra + o banner/logo da própria barbearia — a única
         * cor permitida na página é a que vier do asset do tenant. */}
        <section className="relative isolate overflow-hidden border-b border-line">
          {bannerUrl ? (
            // aspect-ratio (não altura fixa em px) pra caixa do banner escalar
            // com a largura da tela: com altura fixa, o object-cover cropava
            // muito mais dos lados em telas estreitas do que em telas largas,
            // cortando texto/logo que o lojista desenhou perto da borda da imagem.
            <div className="relative aspect-3/1 w-full">
              <img src={bannerUrl} alt="" className="size-full object-cover" />
              <div className="absolute inset-0 bg-linear-to-t from-surface via-surface/10 to-transparent" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 px-6 pt-12 pb-10 text-center">
              <span className="flex size-14 items-center justify-center rounded-md border border-line-strong">
                <Scissors className="size-6" strokeWidth={1.5} />
              </span>
              <span className="text-[0.6875rem] font-medium tracking-[0.16em] text-fg-muted uppercase">
                Agendamento online
              </span>
              <h1 className="font-heading text-3xl leading-none font-semibold tracking-tight uppercase sm:text-4xl">
                Agende seu horário
              </h1>
            </div>
          )}
        </section>

        {/* Ficha da barbearia. */}
        <main className="animate-in fade-in slide-in-from-bottom-3 duration-500 flex flex-col items-center gap-4 px-6 pt-8 pb-10 text-center">
          <TenantAvatar
            logoUrl={logoUrl}
            className={bannerUrl ? "-mt-16 size-20 border-2 border-surface shadow-md" : "size-20"}
          />

          <div className="flex flex-col items-center gap-1">
            <span className="text-[0.6875rem] font-medium tracking-[0.16em] text-fg-muted uppercase">
              {tenant.name}
            </span>
            <h2 className="font-heading text-xl font-semibold">{tenant.name}</h2>
          </div>

          <div className="flex flex-col items-center gap-2">
            {openStatus && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-line-strong px-3 py-1 text-xs font-medium">
                <span
                  className={
                    openStatus.isOpen ? "size-1.5 rounded-full bg-emerald-500" : "size-1.5 rounded-full bg-fg-faint"
                  }
                />
                {openStatus.isOpen ? "Aberto agora" : "Fechado agora"}
                {openStatus.label ? ` · ${openStatus.label}` : ""}
              </span>
            )}

            {tenant.description && <p className="max-w-sm text-sm text-fg-muted">{tenant.description}</p>}
          </div>

          <div className="flex flex-col items-center gap-2 text-sm text-fg-muted">
            {location && (
              <span className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0" strokeWidth={1.75} />
                {location}
              </span>
            )}

            {tenant.phone && (
              <a href={`tel:${tenant.phone}`} className="flex items-center gap-2 text-fg hover:underline">
                <Phone className="size-4 shrink-0" strokeWidth={1.75} />
                {tenant.phone}
              </a>
            )}

            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-fg hover:underline"
              >
                <AtSign className="size-4 shrink-0" strokeWidth={1.75} />
                Instagram
              </a>
            )}
          </div>

          <Button
            size="lg"
            onClick={() => navigate(`/${slug}/agendar`)}
            className="mt-2 h-12 w-full max-w-xs gap-2 rounded-md bg-fg text-base font-semibold text-surface hover:bg-fg/90"
          >
            <CalendarCheck className="size-5" strokeWidth={2} />
            Agendar horário
          </Button>

          <footer className="mt-4 pt-4">
            <span className="text-xs text-fg-faint">
              Feito com <span className="font-semibold text-fg-muted">KirvoAgenda</span>
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
