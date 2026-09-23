import { z } from "zod";

const pushSubscriptionBody = z.object({
    endpoint: z.string().url({ message: "Endpoint inválido" }),
    keys: z.object({
        p256dh: z.string().min(1, { message: "Chave p256dh obrigatória" }),
        auth: z.string().min(1, { message: "Chave auth obrigatória" }),
    })
});

export const subscribeUserPushSchema = z.object({
    body: pushSubscriptionBody
});

export const subscribeAppointmentPushSchema = z.object({
    params: z.object({
        slug: z.string().min(1, { message: "A barbearia é obrigatória" }),
        id: z.string().uuid({ message: "Agendamento inválido" }),
    }),
    body: pushSubscriptionBody
});
