import { Request, Response } from "express";
import { ResetPasswordService } from "../../services/auth/ResetPasswordService.js";

class ResetPasswordController {
    async handle(req: Request, res: Response) {
        const { token, newPassword } = req.body;

        const resetPasswordService = new ResetPasswordService();
        await resetPasswordService.execute({ token, newPassword });

        return res.status(200).json({ message: "Senha redefinida com sucesso." });
    }
}

export { ResetPasswordController };
