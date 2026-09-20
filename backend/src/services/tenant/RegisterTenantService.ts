import bcrypt from "bcrypt";
import { UserAlreadyExistsError } from "../../errors/tenant/TenantErrors.js";
import prismaClient from "../../prisma/index.js";
import { slugify } from "../../utils/slugify.js";

interface RegisterTenantInput {
    barbershopName: string;
    ownerName: string;
    email: string;
    password: string;
}

// Preço cheio do plano completo, em centavos. Valor herdado do Alô Delivery
// como ponto de partida — a régua comercial da barbearia ainda precisa ser confirmada.
const FULL_PLAN_MONTHLY_PRICE = 4990;

class RegisterTenantService {
    async execute({ barbershopName, ownerName, email, password }: RegisterTenantInput) {
        // E-mail é o login: normaliza pra "Joao@x.com" e "joao@x.com" não virarem contas diferentes.
        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await prismaClient.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (existingUser) {
            throw new UserAlreadyExistsError();
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const { tenant, user } = await prismaClient.$transaction(async (tx) => {
            // Duas barbearias podem ter o mesmo nome; o slug é unique, então
            // desempatamos com sufixo numérico em vez de estourar o constraint.
            const baseSlug = slugify(barbershopName) || "barbearia";
            let slug = baseSlug;
            let suffix = 1;

            while (await tx.tenant.findUnique({ where: { slug }, select: { id: true } })) {
                suffix += 1;
                slug = `${baseSlug}-${suffix}`;
            }

            const tenant = await tx.tenant.create({
                data: {
                    name: barbershopName,
                    slug,
                },
            });

            // A Subscription nasce na mesma transação do tenant. Sem ela,
            // getEffectivePlan trata o tenant como "sem assinatura cadastrada" e
            // nunca conta os 30 dias de trial — ele ficaria "completo" pra sempre.
            await tx.subscription.create({
                data: {
                    tenantId: tenant.id,
                    planName: "Completo",
                    monthlyPrice: FULL_PLAN_MONTHLY_PRICE,
                    status: "trial",
                    startedAt: new Date()
                }
            });

            const user = await tx.user.create({
                data: {
                    tenantId: tenant.id,
                    name: ownerName,
                    email: normalizedEmail,
                    passwordHash,
                    role: "store_owner",
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    tenantId: true
                }
            });

            return { tenant, user };
        });

        return { tenant, user };
    }
}

export { RegisterTenantService };
