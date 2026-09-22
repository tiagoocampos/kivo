import prismaClient from "../../prisma/index.js";

interface ListCustomersServiceProps {
    tenantId: string;
}

class ListCustomersService {
    async execute({ tenantId }: ListCustomersServiceProps) {

        const customers = await prismaClient.customer.findMany({
            where: {
                tenantId
            },
            orderBy: {
                createdAt: "desc"
            },
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                createdAt: true,
                _count: {
                    select: { appointments: true }
                }
            }
        });

        return customers.map(({ _count, ...customer }) => ({
            ...customer,
            appointmentsCount: _count.appointments
        }));
    }
}

export { ListCustomersService };
