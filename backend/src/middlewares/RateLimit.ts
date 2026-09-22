import rateLimit from "express-rate-limit";

export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Muitas tentativas. Tente novamente em alguns minutos." }
});

// Criar agendamento é a rota pública mais sensível: cada chamada bem-sucedida
// ocupa um horário real na agenda de alguém.
export const publicBookingRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Muitos agendamentos enviados. Aguarde alguns minutos." }
});

// Disponibilidade é consultada a cada dia que o cliente toca na tela (e roda uma
// consulta por profissional no "qualquer profissional"), então o teto é mais folgado.
export const availabilityRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Muitas consultas em pouco tempo. Aguarde um instante." }
});
