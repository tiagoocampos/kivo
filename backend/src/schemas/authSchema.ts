import { z } from "zod";

export const forgotPasswordSchema =
    z.object({
        body: z.object({
            email: z.string().email({ message: "E-mail inválido" }),
        })
    })

// min(8) espelha o que a tela de redefinição do painel já comunica ao usuário
// ("Mínimo 8 caracteres") — mais estrito que o mínimo de 6 usado no cadastro/login.
export const resetPasswordSchema =
    z.object({
        body: z.object({
            token: z.string().min(1, { message: "Token é obrigatório" }),
            newPassword: z.string().min(8, { message: "A senha deve ter pelo menos 8 caracteres" }),
        })
    })
