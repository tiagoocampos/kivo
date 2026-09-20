// Em requisições multipart, todo campo chega como string ("true"/"false").
// validateSchema não reescreve req.body, então quem consome o body converte.
export function parseFormBoolean(value: unknown): boolean | undefined {
    if (value === undefined || value === "") return undefined;
    return value === true || value === "true";
}
