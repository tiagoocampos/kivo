// Telefone é identificador único (login do cliente, conta por barbearia), então
// toda escrita e busca precisa normalizar pro mesmo formato: só dígitos.
export function normalizePhone(value: string): string {
    return value.replace(/\D/g, "");
}
