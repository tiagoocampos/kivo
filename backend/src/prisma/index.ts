import "dotenv/config";
import { PrismaClient } from '../generated/prisma/client.js'
import { PrismaPg } from "@prisma/adapter-pg"

const connectionString = `${process.env.DATABASE_URL!}`;

// Força a sessão do Postgres pra UTC. Sem isso, se o servidor de banco tiver
// um TimeZone padrão diferente de UTC (comum fora de nuvens gerenciadas — ex:
// um Postgres local cujo SO está em America/Sao_Paulo), o adapter-pg lê de volta
// todo TIMESTAMPTZ (scheduledAt, endsAt, createdAt...) deslocado pelo fuso da
// sessão, silenciosamente. Pego isso rodando o motor de disponibilidade contra
// um Postgres real: os horários voltavam 3h errados, sem nenhum erro no meio do caminho.
const adapter = new PrismaPg({ connectionString, options: "-c TimeZone=UTC" })
const prismaClient = new PrismaClient({ adapter })

export default prismaClient;

