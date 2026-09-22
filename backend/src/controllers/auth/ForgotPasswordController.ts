import { Request, Response } from "express";
import { ForgotPasswordService } from "../../services/auth/ForgotPasswordService.js";

class ForgotPasswordController {
    async handle(req: Request, res: Response) {
        const { email } = req.body;

        const forgotPasswordService = new ForgotPasswordService();
        await forgotPasswordService.execute({ email });

        return res.status(200).json({ message: "Se o e-mail existir, enviaremos as instruções de redefinição." });
    }
}

export { ForgotPasswordController };
