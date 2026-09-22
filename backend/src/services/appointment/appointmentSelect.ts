// Fonte única do formato de resposta de Appointment usado em toda a aplicação
// (storefront, conta do cliente final e painel da loja) — CreateAppointmentService,
// CancelCustomerAppointmentService e os services novos do painel devolvem
// exatamente este shape, pra nenhum consumidor precisar tratar formatos diferentes.
export const APPOINTMENT_SELECT = {
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
} as const;
