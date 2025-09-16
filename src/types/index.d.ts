import { User } from "@prisma/client";

export interface JwtPayload extends User {}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
