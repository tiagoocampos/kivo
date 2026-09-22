import { AppError } from "../AppError.js";

// Horário que deixou de estar livre (alguém marcou antes), que nunca esteve livre
// (fora do expediente, fora da grade, já passou) ou que não existe. 409 porque o
// front trata esse status voltando pra escolha de horário.
export class AppointmentSlotUnavailableError extends AppError {
    constructor() {
        super("Esse horário não está mais disponível. Escolha outro.", 409);
        this.name = "AppointmentSlotUnavailableError";
        Object.setPrototypeOf(this, AppointmentSlotUnavailableError.prototype);
    }
}

export class AppointmentNotFoundError extends AppError {
    constructor() {
        super("Agendamento não encontrado", 404);
        this.name = "AppointmentNotFoundError";
        Object.setPrototypeOf(this, AppointmentNotFoundError.prototype);
    }
}

export class AppointmentCannotBeCanceledError extends AppError {
    constructor(message: string) {
        super(message, 422);
        this.name = "AppointmentCannotBeCanceledError";
        Object.setPrototypeOf(this, AppointmentCannotBeCanceledError.prototype);
    }
}

// Transição de status fora da máquina de estados (ver utils/appointmentStatus.ts)
// — ex: tentar "concluir" um agendamento que ainda nem foi confirmado.
export class InvalidAppointmentStatusTransitionError extends AppError {
    constructor(from: string, to: string) {
        super(`Não é possível mudar o status de "${from}" para "${to}"`, 400);
        this.name = "InvalidAppointmentStatusTransitionError";
        Object.setPrototypeOf(this, InvalidAppointmentStatusTransitionError.prototype);
    }
}
