// Fonte única do formato de resposta de /tenant/me (GET e PUT devolvem
// exatamente o mesmo shape) — evita os dois endpoints divergirem com o tempo.
export const TENANT_SELECT = {
    id: true,
    name: true,
    slug: true,
    phone: true,
    description: true,
    address: true,
    city: true,
    instagramUrl: true,
    logoUrl: true,
    bannerUrl: true,
    faviconUrl: true,
    timezone: true,
    businessHours: true,
    minCancelHoursBefore: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
    subscription: {
        select: {
            status: true,
            monthlyPrice: true,
            startedAt: true
        }
    }
} as const;
