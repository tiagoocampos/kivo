import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { TenantNotFoundError } from "../../errors/tenant/TenantErrors.js";
import { CustomerAlreadyExistsError } from "../../errors/customer/CustomerErrors.js";
import prismaClient from "../../prisma/index.js";

interface RegisterCustomerServiceProps {
    slug: string;
    name: string;
    phone: string; // já normalizado (só dígitos)
    email?: string | undefined;
    password: string;
}

class RegisterCustomerService {
    async execute({ slug, name, phone, email, password }: RegisterCustomerServiceProps) {

        const tenant = await prismaClient.tenant.findUnique({
            where: { slug },
            select: { id: true }
        });

        if (!tenant) {
            throw new TenantNotFoundError();
        }

        // Conta é por barbearia: a mesma pessoa pode ter uma conta em cada
        // tenant, nunca uma conta global da plataforma.
        const existingCustomer = await prismaClient.customer.findUnique({
            where: {
                tenantId_phone: {
                    tenantId: tenant.id,
                    phone
                }
            },
            select: { id: true, passwordHash: true }
        });

        // Já existe um registro sem senha (nasceu de um agendamento como
        // convidado): "adota" esse registro em vez de recusar o cadastro —
        // pro cliente, é a primeira vez que ele está criando uma conta.
        if (existingCustomer && existingCustomer.passwordHash !== null) {
            throw new CustomerAlreadyExistsError();
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const customer = existingCustomer
            ? await prismaClient.customer.update({
                where: { id: existingCustomer.id },
                data: { name, email: email ?? null, passwordHash },
                select: { id: true, name: true, phone: true, email: true }
            })
            : await prismaClient.customer.create({
                data: {
                    tenantId: tenant.id,
                    name,
                    phone,
                    email: email ?? null,
                    passwordHash
                },
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    email: true
                }
            });

        // type: "customer" separa este token do de dono/funcionário (type: "store_user").
        const token = jwt.sign({
            tenantId: tenant.id,
            type: "customer",
        }, process.env.JWT_SECRET as string, {
            subject: customer.id,
            expiresIn: "1d"
        });

        return {
            token,
            customer
        };
    }
}

export { RegisterCustomerService };
