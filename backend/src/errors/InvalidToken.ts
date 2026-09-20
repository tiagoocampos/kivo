import { AppError } from "./AppError.js";

export class InvalidToken extends AppError {
    constructor() {
        super("Token inválido", 401);
        this.name = "InvalidToken";
        Object.setPrototypeOf(this, InvalidToken.prototype);
    }
}
