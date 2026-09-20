import { AppError } from "../AppError.js";

export class InvalidImageTypeError extends AppError {
    constructor() {
        super("Tipo de arquivo inválido, envie JPEG, JPG ou PNG", 400);
        this.name = "InvalidImageTypeError";
        Object.setPrototypeOf(this, InvalidImageTypeError.prototype);
    }
}

export class ImageUploadError extends AppError {
    constructor() {
        super("Erro ao fazer upload da imagem", 502);
        this.name = "ImageUploadError";
        Object.setPrototypeOf(this, ImageUploadError.prototype);
    }
}
