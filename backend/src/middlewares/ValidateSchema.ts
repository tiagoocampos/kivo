import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodType } from 'zod';


export const validateSchema =
    (schema: ZodType) => async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params
            })

            return next();
        }
        catch (error) {

            return next(error);
        }
    }