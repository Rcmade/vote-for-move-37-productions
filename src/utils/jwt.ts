import dotenv from "dotenv";
import jwt, { Secret, SignOptions } from "jsonwebtoken";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ||
  "7d") as SignOptions["expiresIn"];

const SIGNING_SECRET = JWT_SECRET as Secret;

export function signJwt(payload: object) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");

  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
  return jwt.sign(payload, SIGNING_SECRET, options);
}

export function verifyJwt<T = unknown>(token: string): T {
  return jwt.verify(token, SIGNING_SECRET) as T;
}
