import { AppError } from "../AppError.js";

export class UserNotFoundError extends AppError {
    constructor() {
        super("Usuário não encontrado", 404);
        this.name = "UserNotFoundError";
        Object.setPrototypeOf(this, UserNotFoundError.prototype);
    }
}

export class PasswordNotMatchError extends AppError {
    constructor() {
        super("Senha incorreta", 401);
        this.name = "PasswordNotMatchError";
        Object.setPrototypeOf(this, PasswordNotMatchError.prototype);
    }
}
