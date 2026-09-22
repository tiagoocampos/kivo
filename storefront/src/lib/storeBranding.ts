import type { Tenant } from "@/types"

// Fonte única do que cada tela mostra como marca da barbearia. Qualquer tela
// que precise de logo/banner lê daqui, nunca de tenant.logoUrl/bannerUrl direto —
// assim, se um dia houver regra por plano (como no Alô Delivery), muda num lugar só.
// Ausência de logo/banner é normal (barbearia recém-criada): quem consome cai
// no fallback genérico do KirvoAgenda.
export function getStoreBranding(tenant: Tenant) {
  return {
    logoUrl: tenant.logoUrl || null,
    bannerUrl: tenant.bannerUrl || null,
  }
}
