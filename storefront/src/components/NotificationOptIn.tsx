import { useState } from "react"
import { Bell, BellOff, BellRing, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { isIOS, isStandalone } from "@/lib/device"
import { urlBase64ToUint8Array } from "@/lib/push"
import { getVapidPublicKey, subscribeAppointmentPush } from "@/services/push"

interface NotificationOptInProps {
  slug: string
  appointmentId: string
}

type Status = "idle" | "subscribing" | "subscribed" | "error"

// Suporte real a Web Push: precisa de Notification, Service Worker e Push API.
// Safari desktop/iOS fora do modo instalado não tem PushManager.
function isPushSupported() {
  return typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator && "PushManager" in window
}

export function NotificationOptIn({ slug, appointmentId }: NotificationOptInProps) {
  const [status, setStatus] = useState<Status>("idle")

  if (!isPushSupported()) {
    // iOS fora do modo instalado cai aqui também (sem PushManager no Safari comum).
    if (isIOS && !isStandalone()) {
      return (
        <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3.5 text-sm">
          <span className="font-medium text-foreground">Quer receber avisos do seu horário?</span>
          <p className="text-xs text-muted-foreground">
            No iPhone, isso só funciona com o app instalado. Toque no ícone de compartilhar (
            <Share className="inline size-3.5 align-text-bottom" />) e escolha{" "}
            <strong className="text-foreground">"Adicionar à Tela de Início"</strong> pra ativar.
          </p>
        </div>
      )
    }

    return null
  }

  if (Notification.permission === "denied") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">
        <BellOff className="size-4 shrink-0" />
        As notificações estão bloqueadas no navegador. Pra ativar, permita notificações pra este site nas
        configurações do navegador.
      </div>
    )
  }

  if (isIOS && !isStandalone()) {
    return (
      <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3.5 text-sm">
        <span className="font-medium text-foreground">Quer receber avisos do seu horário?</span>
        <p className="text-xs text-muted-foreground">
          No iPhone, isso só funciona com o app instalado. Toque no ícone de compartilhar (
          <Share className="inline size-3.5 align-text-bottom" />) e escolha{" "}
          <strong className="text-foreground">"Adicionar à Tela de Início"</strong> pra ativar.
        </p>
      </div>
    )
  }

  if (status === "subscribed") {
    return (
      <Button variant="secondary" size="lg" className="w-full" disabled>
        <BellRing /> Notificações ativadas
      </Button>
    )
  }

  const handleEnable = async () => {
    setStatus("subscribing")

    try {
      let permission = Notification.permission
      if (permission === "default") {
        permission = await Notification.requestPermission()
      }

      if (permission !== "granted") {
        setStatus("idle")
        return
      }

      const publicKey = await getVapidPublicKey()
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      })

      const json = subscription.toJSON()
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        throw new Error("Inscrição de push incompleta")
      }

      await subscribeAppointmentPush(slug, appointmentId, {
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      })

      setStatus("subscribed")
    } catch {
      setStatus("error")
    }
  }

  if (status === "error") {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-destructive">Não deu pra ativar as notificações agora.</p>
        <Button variant="outline" size="lg" className="w-full" onClick={handleEnable}>
          <Bell /> Tentar de novo
        </Button>
      </div>
    )
  }

  return (
    <Button variant="outline" size="lg" className="w-full" onClick={handleEnable} disabled={status === "subscribing"}>
      <Bell /> {status === "subscribing" ? "Ativando..." : "Ativar notificações"}
    </Button>
  )
}
