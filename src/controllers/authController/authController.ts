import { ApiError } from "@/middlewares/errorHandler";
import {
  findUserByEmail,
  createUser,
  validatePassword,
} from "@/services/authService";
import { LoginSchemaT, SignupSchemaT } from "@/zodSchema/authSchema";
import { User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { signJwt } from "@/utils/jwt";

export async function signupRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const body = res.locals.validated as SignupSchemaT;
    if (!body) {
      return next(new ApiError("Missing request body", 400));
    }

    // Check if user already exists
    const existing = await findUserByEmail(body.email);
    if (existing) {
      // don't leak internal details
      return next(new ApiError("Email already in use", 409, "EMAIL_TAKEN"));
    }

    // Create user (service should hash password)
    const user = await createUser({
      name: body.name,
      email: body.email,
      password: body.password,
    });

    // Sign JWT
    const token = signJwt({ userId: user.id, email: user.email });

    // Set cookie (httpOnly)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      // optionally set maxAge if you want: maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Return safe user object
    return res.status(201).json({ ok: true, user });
  } catch (err: any) {
    // Prisma unique constraint (if createUser didn't check)
    if (err?.code === "P2002") {
      return next(new ApiError("Email already in use", 409, "EMAIL_TAKEN"));
    }
    return next(err);
  }
}

//  Login controller
export async function loginRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const body = res.locals.validated as LoginSchemaT;
    if (!body) {
      return next(new ApiError("Missing request body", 400));
    }

    const user = await findUserByEmail(body.email);
    if (!user) {
      return next(
        new ApiError("Invalid credentials", 401, "INVALID_CREDENTIALS")
      );
    }

    const isValid = await validatePassword(body.password, user.passwordHash);
    if (!isValid) {
      return next(
        new ApiError("Invalid credentials", 401, "INVALID_CREDENTIALS")
      );
    }

    const token = signJwt({ userId: user.id, email: user.email });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
    } as Partial<User>;

    return res.status(200).json({ ok: true, user: safeUser });
  } catch (err) {
    return next(err);
  }
}

// Get current user
export async function getMe(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const user = req?.user;

  return res.json(user);
}

// Logout - clears the token cookie
export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
