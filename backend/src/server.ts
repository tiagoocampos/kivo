import express from "express";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import { errorHandler } from "./middlewares/ErrorHandler.js";
import { router } from "./routes.js";

const app = express();
app.set("trust proxy", 1); // atrás do proxy do Railway — sem isso, o rate limiting derruba o backend
app.use(helmet());
app.use(express.json());

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "").split(",").map((o) => o.trim());

app.use(
    cors({
        origin: (origin, callback) => {
            // "origin" vem undefined em chamadas sem navegador (ex: Postman, curl) — permita
            // isso passar, já que não representa um navegador de terceiro tentando acessar via browser.
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Origem não permitida por CORS"));
            }
        },
    })
);

app.get("/", (req, res) => {
    res.send("Hello World!");
})

app.use(router)

// O errorHandler precisa ser o último middleware: só assim ele recebe os erros
// lançados pelas rotas.
app.use(errorHandler);

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running na port http://localhost:${PORT}`);
})
