import { Prisma } from "../../generated/prisma/client.js";
import { AppointmentSlotUnavailableError } from "../../errors/appointment/AppointmentErrors.js";
import { CustomerTenantMismatchError } from "../../errors/customer/CustomerErrors.js";
import { ProfessionalNotFoundError } from "../../errors/professional/ProfessionalErrors.js";
import { ServiceNotFoundError } from "../../errors/service/ServiceErrors.js";
import { TenantInactiveError } from "../../errors/tenant/TenantErrors.js";
import prismaClient from "../../prisma/index.js";
import { normalizePhone } from "../../utils/phone.js";
import { zonedTimeToUtc } from "../../utils/timezone.js";
import { resolveTenantOrThrow } from "../tenant/resolveTenantOrThrow.js";
import { computeProfessionalSlots } from "../availability/computeProfessionalSlots.js";

interface CreateAppointmentServiceProps {
    slug: string;
    serviceId: string;
    // Ausente = "qualquer profissional": o service escolhe quem estiver livre.
    professionalId?: string | undefined;
    date: string; // "YYYY-MM-DD" no fuso da barbearia
    time: string; // "HH:mm" no fuso da barbearia
    customerName: string;
    customerPhone: string;
    customerAuth?: { customerId: string; tenantId: string } | undefined;
    now?: Date | undefined;
}

class CreateAppointmentService {
    async execute({
        slug,
        serviceId,
        professionalId,
        date,
        time,
        customerName,
        customerPhone,
        customerAuth,
        now = new Date()
    }: CreateAppointmentServiceProps) {

        const tenant = await resolveTenantOrThrow({ slug });

        if (!tenant.isActive) {
            throw new TenantInactiveError();
        }

        // Agendamento público aceita tanto convidado (sem customerAuth) quanto
        // cliente logado — mas nunca vincula a um cliente de outra barbearia,
        // mesmo que o token seja válido.
        if (customerAuth && customerAuth.tenantId !== tenant.id) {
            throw new CustomerTenantMismatchError();
        }

        const service = await prismaClient.service.findFirst({
            where: {
                id: serviceId,
                tenantId: tenant.id,
                isActive: true
            },
            select: {
                id: true,
                name: true,
                durationMinutes: true,
                price: true
            }
        });

        if (!service) {
            throw new ServiceNotFoundError();
        }

        const candidateIds = professionalId
            ? [professionalId]
            : (
                await prismaClient.professional.findMany({
                    where: { tenantId: tenant.id, isActive: true },
                    orderBy: [{ name: "asc" }, { id: "asc" }],
                    select: { id: true }
                })
            ).map((professional) => professional.id);

        if (professionalId) {
            const professionalExists = await prismaClient.professional.findFirst({
                where: { id: professionalId, tenantId: tenant.id, isActive: true },
                select: { id: true }
            });

            if (!professionalExists) {
                throw new ProfessionalNotFoundError();
            }
        } else if (candidateIds.length === 0) {
            throw new AppointmentSlotUnavailableError();
        }

        // "14:30" pode não existir naquele dia (salto do horário de verão) — trata
        // como slot indisponível, não como erro de validação de formato.
        const scheduledAt = zonedTimeToUtc(date, time, tenant.timezone);
        if (!scheduledAt) {
            throw new AppointmentSlotUnavailableError();
        }

        const endsAt = new Date(scheduledAt.getTime() + service.durationMinutes * 60_000);
        const normalizedPhone = normalizePhone(customerPhone);

        // Convidado (sem customerAuth) também vira um Customer, sem senha —
        // é assim que ele aparece na tela de Clientes do painel. Se já
        // existir um registro pra esse telefone (de outro agendamento ou de
        // uma conta de verdade), só reaproveita o id.
        const customerId = customerAuth
            ? customerAuth.customerId
            : (
                await prismaClient.customer.upsert({
                    where: { tenantId_phone: { tenantId: tenant.id, phone: normalizedPhone } },
                    update: { name: customerName },
                    create: {
                        tenantId: tenant.id,
                        name: customerName,
                        phone: normalizedPhone,
                        passwordHash: null
                    },
                    select: { id: true }
                })
            ).id;

        try {
            return await prismaClient.$transaction(
                async (tx) => {
                    // Revalida a disponibilidade DENTRO da transação, nunca confiando no
                    // que o front mostrou — outro agendamento pode ter sido criado entre a
                    // consulta e esta chamada. Sob isolamento serializable, se dois
                    // clientes disputarem o mesmo horário ao mesmo tempo, o Postgres detecta
                    // o conflito e um dos dois recebe erro de serialização (tratado abaixo).
                    let chosenId: string | null = null;

                    for (const candidateId of candidateIds) {
                        const slots = await computeProfessionalSlots(tx, {
                            professionalId: candidateId,
                            serviceDurationMinutes: service.durationMinutes,
                            date,
                            timezone: tenant.timezone,
                            now
                        });

                        if (slots.includes(time)) {
                            chosenId = candidateId;
                            break;
                        }
                    }

                    if (!chosenId) {
                        throw new AppointmentSlotUnavailableError();
                    }

                    return tx.appointment.create({
                        data: {
                            tenantId: tenant.id,
                            professionalId: chosenId,
                            serviceId: service.id,
                            customerId,
                            customerName,
                            customerPhone: normalizedPhone,
                            scheduledAt,
                            endsAt,
                            price: service.price,
                            status: "agendado"
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
                },
                { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
            );
        } catch (error) {
            // P2034: conflito de escrita detectado pelo Postgres sob serializable —
            // é exatamente a corrida de dois clientes pro mesmo horário.
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
                throw new AppointmentSlotUnavailableError();
            }

            throw error;
        }
    }
}

export { CreateAppointmentService };
