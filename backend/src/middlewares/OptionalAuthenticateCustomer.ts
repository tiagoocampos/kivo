import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { InvalidToken } from "../errors/InvalidToken.js";

interface CustomerTokenPayload {
    sub: string;
    tenantId: string;
    type: string;
}

// Usado em rotas públicas (ex: criar agendamento) que aceitam tanto convidado
// quanto cliente logado. Sem header, segue como convidado. Com header
// inválido/expirado, lança erro — não mascara um token quebrado como
// se fosse um agendamento de convidado.
export function optionalAuthenticateCustomer(req: Request, res: Response, next: NextFunction) {

    const authToken = req.headers.authorization;

    if (!authToken) {
        return next();
    }

    const [scheme, token] = authToken.split(" ");

    if (scheme !== "Bearer" || !token) {
        throw new InvalidToken();
    }

    try {
        const { sub, tenantId, type } = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as CustomerTokenPayload;

        if (type !== "customer") {
            throw new InvalidToken();
        }

        req.customerAuth = {
            customerId: sub,
            tenantId
        };

        return next();
    } catch (error) {
        throw new InvalidToken();
    }
}
