import { Request, Response } from "express";
import { RegisterCustomerService } from "../../services/customer/RegisterCustomerService.js";
import { normalizePhone } from "../../utils/phone.js";

class RegisterCustomerController {
    async handle(req: Request, res: Response) {
        const slug = req.params.slug as string;
        const { name, phone, email, password } = req.body;

        const registerCustomerService = new RegisterCustomerService();
        const result = await registerCustomerService.execute({
            slug,
            name,
            phone: normalizePhone(phone),
            email,
            password
        });

        return res.status(201).json(result);
    }
}

export { RegisterCustomerController };
