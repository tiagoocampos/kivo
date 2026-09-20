import { Request, Response, NextFunction } from "express";
import { ForbiddenRoleError } from "../errors/auth/AuthErrors.js";
import type { Role } from "../generated/prisma/enums.js";

export function authorize(...roles: Role[]) {
    return (req: Request, res: Response, next: NextFunction) => {

        if (!req.auth || !roles.includes(req.auth.role)) {
            throw new ForbiddenRoleError();
        }

        return next();
    };
}
