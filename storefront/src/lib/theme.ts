// Espelho, em JS, das cores de marca definidas como variáveis CSS em index.css
// (--brand e --background). Só o manifest do PWA e a <meta theme-color> precisam
// disso, porque não enxergam CSS. Ao trocar a paleta padrão (ou ao implementar cor
// por barbearia), atualizar aqui junto com o index.css.
export const THEME_COLOR = "#0f172a" // --brand
export const BACKGROUND_COLOR = "#ffffff" // --background (tema claro)
