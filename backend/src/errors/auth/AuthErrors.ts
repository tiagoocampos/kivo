import { AppError } from "../AppError.js";

export class ForbiddenRoleError extends AppError {
    constructor() {
        super("Você não tem permissão para executar esta ação", 403);
        this.name = "ForbiddenRoleError";
        Object.setPrototypeOf(this, ForbiddenRoleError.prototype);
    }
}

export class TenantRequiredError extends AppError {
    constructor() {
        super("Esta rota exige um usuário vinculado a uma barbearia", 403);
        this.name = "TenantRequiredError";
        Object.setPrototypeOf(this, TenantRequiredError.prototype);
    }
}

// Token de redefinição de senha inexistente ou expirado (TTL de 1h) — mesma
// mensagem pros dois casos, não precisa distinguir pro usuário.
export class InvalidResetTokenError extends AppError {
    constructor() {
        super("Link inválido ou expirado. Solicite um novo.", 400);
        this.name = "InvalidResetTokenError";
        Object.setPrototypeOf(this, InvalidResetTokenError.prototype);
    }
}
