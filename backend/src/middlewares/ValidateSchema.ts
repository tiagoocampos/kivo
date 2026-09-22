import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodType } from 'zod';


export const validateSchema =
    (schema: ZodType) => async (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params
            }) as { body?: unknown; query?: unknown; params?: unknown }

            if (parsed.body !== undefined) req.body = parsed.body;
            // req.query é um getter só-leitura no protótipo do Express 5 —
            // uma atribuição direta lançaria TypeError. defineProperty cria
            // uma propriedade própria nesta instância, que tem precedência.
            if (parsed.query !== undefined) {
                Object.defineProperty(req, 'query', {
                    value: parsed.query,
                    configurable: true,
                    enumerable: true,
                    writable: true
                });
            }
            if (parsed.params !== undefined) req.params = parsed.params as typeof req.params;

            return next();
        }
        catch (error) {

            return next(error);
        }
    }