import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { UserNotFoundError } from "../../errors/user/UserErrors.js";
import prismaClient from "../../prisma/index.js";

interface LoginServiceProps {
    email: string;
    password: string;
}

class LoginTenantService {
    async execute({ email, password }: LoginServiceProps) {
        const user = await prismaClient.user.findUnique({
            where: { email: email.trim().toLowerCase() },
        });

        // Senha errada (e usuário desativado) devolvem o mesmo erro de e-mail
        // inexistente, de propósito, pra não entregar quais e-mails estão cadastrados.
        if (!user || !user.isActive) {
            throw new UserNotFoundError();
        }

        const passwordMatch = await compare(password, user.passwordHash);
        if (!passwordMatch) {
            throw new UserNotFoundError();
        }

        // type: "store_user" separa este token do de cliente final (type: "customer").
        const token = jwt.sign({
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
            type: "store_user",
        }, process.env.JWT_SECRET as string, {
            subject: user.id,
            expiresIn: "1d"
        });

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId,
            token
        };
    }
}

export { LoginTenantService };
