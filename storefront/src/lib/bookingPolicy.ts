// Texto da política de cancelamento mostrado ao cliente. GENÉRICO DE PROPÓSITO:
// a antecedência mínima pra cancelar/remarcar ainda não foi decidida — quando for,
// é só trocar estas duas frases (ex: "Cancele com até 2 horas de antecedência.").
export const CANCELLATION_POLICY = {
  guest: "Precisa cancelar ou remarcar? Avise a barbearia o quanto antes.",
  account:
    "Você pode cancelar em “Meus agendamentos” enquanto ele estiver como “Agendado”. Para remarcar, fale com a barbearia.",
}

export function getCancellationPolicyText(isAuthenticated: boolean): string {
  return isAuthenticated ? CANCELLATION_POLICY.account : CANCELLATION_POLICY.guest
}
