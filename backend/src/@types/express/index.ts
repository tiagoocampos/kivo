import 'express-serve-static-core';
import type { Role } from '../../generated/prisma/enums.js';

declare module 'express-serve-static-core' {
    interface Request {
        auth: {
            userId: string;
            tenantId: string | null;
            role: Role;
        };
        customerAuth?: {
            customerId: string;
            tenantId: string;
        };
    }
}
