import {
  signupRequest
} from "@/controllers/authController";
import { validate } from "@/middlewares/validate";
import { signupSchema } from "@/zodSchema/authSchema";
import { Router, type Router as ExpressRouter } from "express";

const usersRoutes: ExpressRouter = Router();

// Users
usersRoutes.post("/users", validate(signupSchema), signupRequest);

export default usersRoutes;
