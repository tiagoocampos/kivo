import { CustomerNotFoundError } from "../../errors/customer/CustomerErrors.js";
import prismaClient from "../../prisma/index.js";
import { APPOINTMENT_SELECT } from "../appointment/appointmentSelect.js";

interface GetCustomerAppointmentsServiceProps {
    tenantId: string;
    customerId: string;
}

class GetCustomerAppointmentsService {
    // Valida posse (o cliente pertence a este tenant) antes de buscar qualquer
    // agendamento — um id de cliente de outra barbearia é "não encontrado", nunca vaza.
    async execute({ tenantId, customerId }: GetCustomerAppointmentsServiceProps) {

        const customer = await prismaClient.customer.findFirst({
            where: {
                id: customerId,
                tenantId
            },
            select: {
                id: true
            }
        });

        if (!customer) {
            throw new CustomerNotFoundError();
        }

        return prismaClient.appointment.findMany({
            where: {
                customerId: customer.id,
                tenantId
            },
            orderBy: {
                scheduledAt: "desc"
            },
            select: APPOINTMENT_SELECT
        });
    }
}

export { GetCustomerAppointmentsService };
