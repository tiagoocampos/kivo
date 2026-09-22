interface NotFoundPageProps {
  title?: string
  message?: string
}

export function NotFoundPage({
  title = "Página não encontrada",
  message = "Acesse o agendamento pelo link enviado pela barbearia.",
}: NotFoundPageProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2 p-6 text-center">
      <h1 className="font-heading text-lg font-semibold text-foreground">{title}</h1>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
