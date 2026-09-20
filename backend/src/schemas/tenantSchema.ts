import { z } from "zod";

export const registerTenantSchema =
    z.object({
        body: z.object({
            barbershopName: z.string().trim().min(1, { message: "O nome da barbearia é obrigatório" }),
            ownerName: z.string().trim().min(1, { message: "O nome do responsável é obrigatório" }),
            email: z.string().email({ message: "E-mail inválido" }),
            password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
        })
    })
