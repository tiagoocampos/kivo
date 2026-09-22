import { TenantNotFoundError } from "../../errors/tenant/TenantErrors.js";
import { CustomerTenantMismatchError } from "../../errors/customer/CustomerErrors.js";
import prismaClient from "../../prisma/index.js";

interface ListCustomerAppointmentsServiceProps {
    slug: string;
    customerId: string;
    customerTenantId: string;
}

class ListCustomerAppointmentsService {
    // Dupla checagem por design: o cliente só vê agendamento dele (customerId do
    // token) e só dentro da barbearia resolvida pelo slug da URL (tenantId).
    async execute({ slug, customerId, customerTenantId }: ListCustomerAppointmentsServiceProps) {

        const tenant = await prismaClient.tenant.findUnique({
            where: { slug },
            select: { id: true }
        });

        if (!tenant) {
            throw new TenantNotFoundError();
        }

        if (customerTenantId !== tenant.id) {
            throw new CustomerTenantMismatchError();
        }

        return prismaClient.appointment.findMany({
            where: {
                tenantId: tenant.id,
                customerId
            },
            orderBy: {
                scheduledAt: "desc"
            },
            select: {
                id: true,
                status: true,
                scheduledAt: true,
                endsAt: true,
                price: true,
                customerName: true,
                customerPhone: true,
                cancelReason: true,
                canceledBy: true,
                createdAt: true,
                service: {
                    select: { id: true, name: true, durationMinutes: true }
                },
                professional: {
                    select: { id: true, name: true, photoUrl: true }
                }
            }
        });
    }
}

export { ListCustomerAppointmentsService };
