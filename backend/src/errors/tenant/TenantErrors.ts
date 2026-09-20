import { AppError } from "../AppError.js";

export class UserAlreadyExistsError extends AppError {
    constructor() {
        super("Usuário já cadastrado", 400);
        this.name = "UserAlreadyExistsError";
        Object.setPrototypeOf(this, UserAlreadyExistsError.prototype);
    }
}

export class TenantNotFoundError extends AppError {
    constructor() {
        super("Barbearia não encontrada", 404);
        this.name = "TenantNotFoundError";
        Object.setPrototypeOf(this, TenantNotFoundError.prototype);
    }
}

export class TenantInactiveError extends AppError {
    constructor() {
        super("Esta barbearia não está aceitando agendamentos no momento", 403);
        this.name = "TenantInactiveError";
        Object.setPrototypeOf(this, TenantInactiveError.prototype);
    }
}
