import { User } from "@prisma/client";

export type JwtPayload = User & {};

export type AuthRequest = Request & {
  user?: JwtPayload;
};

export type ErrorCodes =
  | "unauthorized"
  | "invalid_token"
  | "EMAIL_TAKEN"
  | "INVALID_CREDENTIALS"
  | "CREATOR_NOT_FOUND"
  | "POLL_NOT_FOUND";