import {
  getMe,
  loginRequest,
  logout,
  signupRequest,
} from "@/controllers/authController";
import { requireAuth } from "@/middlewares/authMiddleware";
import { validate } from "@/middlewares/validate";
import { loginSchema, signupSchema } from "@/zodSchema/authSchema";
import { Router, type Router as ExpressRouter } from "express";

const authRoutes: ExpressRouter = Router();

// Signup
authRoutes.post("/signup", validate(signupSchema), signupRequest);

// Login
authRoutes.post("/login", validate(loginSchema), loginRequest);

// Current user info
authRoutes.get("/me", requireAuth, getMe);
authRoutes.post("/logout", logout);

export default authRoutes;
