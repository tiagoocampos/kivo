import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { InvalidToken } from "../errors/InvalidToken.js";

interface CustomerTokenPayload {
    sub: string;
    tenantId: string;
    type: string;
}

export function authenticateCustomer(req: Request, res: Response, next: NextFunction) {

    const authToken = req.headers.authorization;

    if (!authToken) {
        throw new InvalidToken();
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

        // Um token de lojista (type: "store_user") nunca pode autenticar
        // como cliente final, mesmo que a assinatura seja válida.
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
