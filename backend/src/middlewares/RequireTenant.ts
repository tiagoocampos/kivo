import { Request, Response, NextFunction } from "express";
import { TenantRequiredError } from "../errors/auth/AuthErrors.js";

export function requireTenant(req: Request, res: Response, next: NextFunction) {

    if (!req.auth?.tenantId) {
        throw new TenantRequiredError();
    }

    return next();
}
