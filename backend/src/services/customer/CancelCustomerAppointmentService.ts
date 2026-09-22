import { TenantNotFoundError } from "../../errors/tenant/TenantErrors.js";
import { CustomerTenantMismatchError } from "../../errors/customer/CustomerErrors.js";
import { AppointmentCannotBeCanceledError, AppointmentNotFoundError } from "../../errors/appointment/AppointmentErrors.js";
import { evaluateCancellation } from "../../utils/cancellation.js";
import prismaClient from "../../prisma/index.js";

const REASON_MESSAGES = {
    status: "Este agendamento não pode mais ser cancelado.",
    deadline: "O prazo para cancelar este agendamento pelo app já passou. Fale com a barbearia."
};

interface CancelCustomerAppointmentServiceProps {
    slug: string;
    appointmentId: string;
    customerId: string;
    customerTenantId: string;
    reason: string;
    now?: Date | undefined;
}

class CancelCustomerAppointmentService {
    // Dupla checagem por design, mesmo padrão do ListCustomerAppointmentsService: o
    // cliente só cancela agendamento dele (customerId do token) e só dentro da
    // barbearia resolvida pelo slug da URL (tenantId).
    async execute({
        slug,
        appointmentId,
        customerId,
        customerTenantId,
        reason,
        now = new Date()
    }: CancelCustomerAppointmentServiceProps) {

        const tenant = await prismaClient.tenant.findUnique({
            where: { slug },
            select: { id: true, minCancelHoursBefore: true }
        });

        if (!tenant) {
            throw new TenantNotFoundError();
        }

        if (customerTenantId !== tenant.id) {
            throw new CustomerTenantMismatchError();
        }

        const appointment = await prismaClient.appointment.findFirst({
            where: {
                id: appointmentId,
                tenantId: tenant.id,
                customerId
            },
            select: {
                id: true,
                status: true,
                scheduledAt: true
            }
        });

        if (!appointment) {
            throw new AppointmentNotFoundError();
        }

        const decision = evaluateCancellation({
            status: appointment.status,
            scheduledAt: appointment.scheduledAt,
            minCancelHoursBefore: tenant.minCancelHoursBefore,
            now
        });

        if (!decision.allowed) {
            throw new AppointmentCannotBeCanceledError(REASON_MESSAGES[decision.reason]);
        }

        return prismaClient.appointment.update({
            where: { id: appointment.id },
            data: {
                status: "cancelado",
                canceledBy: "customer",
                cancelReason: reason
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

export { CancelCustomerAppointmentService };
