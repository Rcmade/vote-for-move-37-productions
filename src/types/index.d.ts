import { User } from "@prisma/client";
import type { Request } from "express";

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
  | "POLL_NOT_FOUND"
  | "OPTION_NOT_FOUND"
  | "DUPLICATE_VOTE"
  | "ALREADY_VOTED";
