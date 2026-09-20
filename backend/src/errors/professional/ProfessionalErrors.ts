import { AppError } from "../AppError.js";

export class ProfessionalNotFoundError extends AppError {
    constructor() {
        super("Profissional não encontrado", 404);
        this.name = "ProfessionalNotFoundError";
        Object.setPrototypeOf(this, ProfessionalNotFoundError.prototype);
    }
}

export class ProfessionalHasAppointmentsError extends AppError {
    constructor() {
        super("Não é possível excluir um profissional que possui agendamentos. Desative-o em vez de excluir.", 400);
        this.name = "ProfessionalHasAppointmentsError";
        Object.setPrototypeOf(this, ProfessionalHasAppointmentsError.prototype);
    }
}
