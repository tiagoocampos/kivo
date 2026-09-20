import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { MulterError } from 'multer';
import { AppError } from '../errors/AppError.js';

export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (error instanceof ZodError) {
        return res.status(400).json({
            error: "Erro de validação",
            details: error.issues.map(issue => ({
                message: issue.message,
                path: issue.path[1],
            })),
        });
    }

    if (error instanceof MulterError) {
        return res.status(400).json({
            error: error.code === "LIMIT_FILE_SIZE"
                ? "A imagem deve ter no máximo 5MB"
                : "Erro no envio do arquivo",
        });
    }

    // Todo erro de domínio (UserNotFoundError, TenantNotFoundError, OrderNotFoundError...)
    // estende AppError e carrega o próprio statusCode.
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }

    console.error(error);
    return res.status(500).json({ error: "Erro interno" });
};
