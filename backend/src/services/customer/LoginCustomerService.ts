import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { TenantNotFoundError } from "../../errors/tenant/TenantErrors.js";
import { CustomerNotFoundError } from "../../errors/customer/CustomerErrors.js";
import prismaClient from "../../prisma/index.js";

interface LoginCustomerServiceProps {
    slug: string;
    phone: string; // já normalizado (só dígitos)
    password: string;
}

class LoginCustomerService {
    async execute({ slug, phone, password }: LoginCustomerServiceProps) {

        const tenant = await prismaClient.tenant.findUnique({
            where: { slug },
            select: { id: true }
        });

        if (!tenant) {
            throw new TenantNotFoundError();
        }

        const customer = await prismaClient.customer.findUnique({
            where: {
                tenantId_phone: {
                    tenantId: tenant.id,
                    phone
                }
            }
        });

        // Senha errada devolve o mesmo erro de telefone inexistente, de
        // propósito, pra não entregar quais telefones têm conta. Um
        // registro sem senha (nasceu de agendamento como convidado, nunca
        // virou conta) cai no mesmo caso — ele precisa se cadastrar primeiro.
        if (!customer || customer.passwordHash === null) {
            throw new CustomerNotFoundError();
        }

        const passwordMatch = await compare(password, customer.passwordHash);
        if (!passwordMatch) {
            throw new CustomerNotFoundError();
        }

        const token = jwt.sign({
            tenantId: customer.tenantId,
            type: "customer",
        }, process.env.JWT_SECRET as string, {
            subject: customer.id,
            expiresIn: "1d"
        });

        return {
            token,
            customer: {
                id: customer.id,
                name: customer.name,
                phone: customer.phone,
                email: customer.email
            }
        };
    }
}

export { LoginCustomerService };
