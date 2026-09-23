import { Request, Response } from "express";

class GetVapidPublicKeyController {
    async handle(req: Request, res: Response) {
        return res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
    }
}

export { GetVapidPublicKeyController };
