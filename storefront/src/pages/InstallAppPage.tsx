import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Download, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TenantAvatar } from "@/components/TenantAvatar"
import { NotFoundPage } from "@/pages/NotFoundPage"
import { getStoreBranding } from "@/lib/storeBranding"
import { applyTenantManifest } from "@/lib/pwaManifest"
import { useInstallPrompt } from "@/hooks/useInstallPrompt"
import { getErrorStatus } from "@/services/api"
import { getBooking } from "@/services/booking"
import type { Tenant } from "@/types"

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches
}

export function InstallAppPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { canInstall, promptInstall } = useInstallPrompt()

  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState<"notFound" | "error" | null>(null)
  const [installing, setInstalling] = useState(false)
  const [alreadyInstalled] = useState(isStandalone)

  useEffect(() => {
    if (!slug) return

    let active = true
    setLoading(true)
    setFailed(null)

    getBooking(slug)
      .then((data) => {
        if (active) setTenant(data.tenant)
      })
      .catch((error: unknown) => {
        if (active) setFailed(getErrorStatus(error) === 404 ? "notFound" : "error")
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [slug])

  // Aplica o manifest da barbearia antes de qualquer clique em instalar — sem
  // isso, a instalação pode sair com o ícone/nome genérico do KirvoAgenda.
  useEffect(() => {
    if (!tenant || !slug) return

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

  if (!slug) return null

  if (loading) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
        <Skeleton className="size-24 rounded-2xl" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-9 w-full max-w-xs" />
      </div>
    )
  }

  if (failed === "notFound" || (!tenant && !failed)) {
    return (
      <NotFoundPage
        title="Barbearia não encontrada"
        message="Verifique o link ou entre em contato com a barbearia."
      />
    )
  }

  if (failed === "error" || !tenant) {
    return (
      <NotFoundPage
        title="Não foi possível carregar"
        message="Verifique sua conexão e abra o link de novo."
      />
    )
  }

  const handleInstall = async () => {
    setInstalling(true)
    await promptInstall()
    setInstalling(false)
    navigate(`/${slug}/agendar`)
  }

  const { logoUrl } = getStoreBranding(tenant)

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <TenantAvatar logoUrl={logoUrl} className="size-24 rounded-2xl shadow-md" />

      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading text-xl font-bold text-foreground">{tenant.name}</h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          Instale o app da {tenant.name} e agende seu horário direto da tela inicial do seu celular.
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col items-center gap-3">
        {alreadyInstalled ? (
          <>
            <p className="text-sm font-medium text-foreground">Você já tem o app instalado! 🎉</p>
            <Button size="lg" className="w-full" onClick={() => navigate(`/${slug}/agendar`)}>
              Agendar horário
            </Button>
          </>
        ) : canInstall ? (
          <Button size="lg" className="w-full" onClick={handleInstall} disabled={installing}>
            <Download />
            {installing ? "Instalando..." : "Instalar app"}
          </Button>
        ) : (
          <div className="rounded-xl border border-border bg-card p-4 text-left text-sm text-muted-foreground">
            {isIOS ? (
              <>
                Toque no ícone de compartilhar (<Share className="inline size-3.5 align-text-bottom" />) e escolha{" "}
                <strong className="text-foreground">"Adicionar à Tela de Início"</strong>.
              </>
            ) : (
              "Abra este link pelo Chrome no seu Android pra instalar o app."
            )}
          </div>
        )}

        <Link to={`/${slug}/agendar`} className="text-xs text-muted-foreground underline-offset-4 hover:underline">
          Prefiro só agendar pelo navegador
        </Link>
      </div>
    </div>
  )
}
