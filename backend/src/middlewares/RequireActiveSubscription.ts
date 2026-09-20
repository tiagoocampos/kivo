import { Request, Response, NextFunction } from "express";
import { SubscriptionCanceledError } from "../errors/subscription/SubscriptionErrors.js";
import prismaClient from "../prisma/index.js";

// Roda depois de authenticate + requireTenant. Tenant sem Subscription
// cadastrada (lojista anterior a essa funcionalidade) não é bloqueado —
// só status "canceled" bloqueia; "trial", "active" e "overdue" passam.
export async function requireActiveSubscription(req: Request, _res: Response, next: NextFunction) {

    const subscription = await prismaClient.subscription.findUnique({
        where: { tenantId: req.auth!.tenantId! },
        select: { status: true }
    });

    if (subscription?.status === "canceled") {
        throw new SubscriptionCanceledError();
    }

    return next();
}
