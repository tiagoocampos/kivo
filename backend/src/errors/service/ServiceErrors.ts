import { AppError } from "../AppError.js";

export class ServiceNotFoundError extends AppError {
    constructor() {
        super("Serviço não encontrado", 404);
        this.name = "ServiceNotFoundError";
        Object.setPrototypeOf(this, ServiceNotFoundError.prototype);
    }
}

export class ServiceHasAppointmentsError extends AppError {
    constructor() {
        super("Não é possível excluir um serviço que possui agendamentos. Desative-o em vez de excluir.", 400);
        this.name = "ServiceHasAppointmentsError";
        Object.setPrototypeOf(this, ServiceHasAppointmentsError.prototype);
    }
}
