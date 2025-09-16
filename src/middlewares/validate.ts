import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

/**
 * Use like: app.post('/auth/otp', validate(requestOtpSchema), controller)
 * Validated value placed in res.locals.validated
 */
export function validate<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      res.locals.validated = validated;
      return next();
    } catch (err) {
      return next(err);
    }
  };
}
