import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // process.env direto (não o helper `env()`, que lança se a variável não
    // existir): `prisma generate` não precisa de DATABASE_URL pra gerar o
    // client, só comandos que batem no banco (migrate, studio...). Usar
    // `env()` aqui derruba o `npm install`/postinstall em plataformas onde a
    // variável só fica disponível no momento do start, não do build.
    url: process.env.DATABASE_URL ?? "",
  },
});