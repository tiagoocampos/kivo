import { randomBytes } from "node:crypto";
import prismaClient from "../../prisma/index.js";

interface ForgotPasswordServiceProps {
    email: string;
}

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1h

class ForgotPasswordService {
    async execute({ email }: ForgotPasswordServiceProps) {
        const user = await prismaClient.user.findUnique({
            where: { email: email.trim().toLowerCase() },
            select: { id: true, isActive: true }
        });

        // Resposta genérica sempre, exista o e-mail ou não — evita enumeração
        // de contas. Só segue com a geração do token se o usuário existir e
        // estiver ativo.
        if (!user || !user.isActive) {
            return;
        }

        const token = randomBytes(32).toString("hex");

        await prismaClient.$transaction([
            prismaClient.passwordResetToken.deleteMany({ where: { userId: user.id } }),
            prismaClient.passwordResetToken.create({
                data: {
                    userId: user.id,
                    token,
                    expiresAt: new Date(Date.now() + TOKEN_TTL_MS)
                }
            })
        ]);

        const painelUrl = process.env.PAINEL_URL ?? "http://localhost:5174";
        const resetLink = `${painelUrl}/redefinir-senha?token=${token}`;

        // TODO: plugar envio real de e-mail via Brevo aqui. Por enquanto só
        // logamos o link pra não travar o resto do fluxo.
        console.log(`[ForgotPasswordService] Link de redefinição de senha: ${resetLink}`);
    }
}

export { ForgotPasswordService };
