import { useState } from "react"
import { Scissors } from "lucide-react"
import { cn } from "@/lib/utils"

interface TenantAvatarProps {
  logoUrl: string | null
  className?: string
  // Aparência do fallback (ícone genérico) — separada porque ele fica sobre fundos diferentes.
  fallbackClassName?: string
}

// Logo da barbearia, ou o ícone genérico do KirvoAgenda quando a barbearia não
// tem logo configurada (ou a URL está quebrada) — nunca uma imagem quebrada.
export function TenantAvatar({ logoUrl, className, fallbackClassName }: TenantAvatarProps) {
  // Guarda de qual URL falhou: se a URL mudar, tenta de novo.
  const [failedUrl, setFailedUrl] = useState<string | null>(null)

  if (logoUrl && failedUrl !== logoUrl) {
    return (
      <img
        src={logoUrl}
        alt=""
        onError={() => setFailedUrl(logoUrl)}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    )
  }

  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground",
        className,
        fallbackClassName
      )}
    >
      <Scissors className="size-1/2" strokeWidth={1.75} />
    </span>
  )
}
