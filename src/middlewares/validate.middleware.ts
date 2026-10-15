import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodType } from 'zod';

export type AnyZodObject = ZodObject<any> | ZodType<any>;

export const validateRequest = (schema: AnyZodObject) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const parsed: any = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (parsed.body !== undefined) {
        req.body = parsed.body;
      }
      if (parsed.query !== undefined) {
        req.query = parsed.query;
      }
      if (parsed.params !== undefined) {
        req.params = parsed.params;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validateRequest;
