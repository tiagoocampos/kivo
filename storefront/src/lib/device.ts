// iOS/Safari só suporta Web Push quando o PWA está instalado na tela de início
// (modo standalone) — em outros navegadores/plataformas o push funciona direto.
export const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

export function isStandalone(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches
}
