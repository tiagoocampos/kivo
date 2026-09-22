import { CustomerNotFoundError } from "../../errors/customer/CustomerErrors.js";
import prismaClient from "../../prisma/index.js";

interface GetCustomerMeServiceProps {
    tenantId: string;
    customerId: string;
}

class GetCustomerMeService {
    async execute({ tenantId, customerId }: GetCustomerMeServiceProps) {

        const customer = await prismaClient.customer.findFirst({
            where: {
                id: customerId,
                tenantId
            },
            select: {
                id: true,
                name: true,
                phone: true,
                email: true
            }
        });

        if (!customer) {
            throw new CustomerNotFoundError();
        }

        return customer;
    }
}

export { GetCustomerMeService };
