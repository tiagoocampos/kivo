// O slug é a chave pública da barbearia (/slug-da-barbearia), então precisa sair
// sem acento, sem espaço e sem caractere especial.
export function slugify(value: string) {
    return value
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
