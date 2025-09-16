import { verifyJwt } from "@/utils/jwt";
import { User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { ApiError } from "./errorHandler";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) throw new ApiError("Unauthorized", 401, "unauthorized");

  try {
    const payload = verifyJwt<User>(token);

    req.user = {
      ...payload,
      id: payload.id || (payload as unknown as { userId: string })?.userId,
    };
    next();
  } catch {
    throw new ApiError(
      "Invalid or expired token, Please try to login again",
      401,
      "invalid_token"
    );
  }
}
