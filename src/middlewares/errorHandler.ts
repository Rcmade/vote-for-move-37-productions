import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: any;
  constructor(message: string, status = 400, code?: string, details?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .json({ error: err.message, code: err.code, details: err.details });
  }

  if (err instanceof ZodError) {
    const issues = err.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    }));
    return res.status(400).json({ error: "Validation error", details: issues });
  }

  // Prisma known errors
  if (err?.code && typeof err?.code === "string") {
    // Example: Mongo unique constraint clash mapping (adjust as needed)
    return res
      .status(500)
      .json({
        error: "Database error",
        code: err.code,
        meta: err.meta || null,
      });
  }

  console.error(err);
  return res.status(500).json({ error: "Internal Server Error" });
}
