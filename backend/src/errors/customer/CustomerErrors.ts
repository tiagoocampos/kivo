import { AppError } from "../AppError.js";

export class CustomerAlreadyExistsError extends AppError {
    constructor() {
        super("Já existe uma conta com este telefone nesta barbearia", 400);
        this.name = "CustomerAlreadyExistsError";
        Object.setPrototypeOf(this, CustomerAlreadyExistsError.prototype);
    }
}

// Mesma resposta pra "telefone não cadastrado" e "senha errada", de propósito,
// pra não entregar quais telefones têm conta.
export class CustomerNotFoundError extends AppError {
    constructor() {
        super("Telefone ou senha inválidos", 404);
        this.name = "CustomerNotFoundError";
        Object.setPrototypeOf(this, CustomerNotFoundError.prototype);
    }
}

// Token de cliente de uma barbearia nunca vale em outra, mesmo com assinatura válida.
export class CustomerTenantMismatchError extends AppError {
    constructor() {
        super("Este cliente não pertence a esta barbearia", 403);
        this.name = "CustomerTenantMismatchError";
        Object.setPrototypeOf(this, CustomerTenantMismatchError.prototype);
    }
}
