import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { InvalidToken } from "../errors/InvalidToken.js";
import type { Role } from "../generated/prisma/enums.js";

interface TokenPayload {
    sub: string;
    role: Role;
    tenantId: string | null;
    type: string;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {

    const authToken = req.headers.authorization;

    if (!authToken) {
        throw new InvalidToken();
    }

    const [scheme, token] = authToken.split(" ");

    if (scheme !== "Bearer" || !token) {
        throw new InvalidToken();
    }

    try {
        const { sub, role, tenantId, type } = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as TokenPayload;

        // Um token de cliente final (type: "customer") nunca pode autenticar
        // como lojista, mesmo que a assinatura seja válida.
        if (type !== "store_user") {
            throw new InvalidToken();
        }

        req.auth = {
            userId: sub,
            tenantId: tenantId ?? null,
            role
        };

        return next();
    } catch (error) {
        throw new InvalidToken();
    }
}
