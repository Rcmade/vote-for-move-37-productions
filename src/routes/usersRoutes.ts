import {
  signupRequest
} from "@/controllers/authController";
import { getUsers } from "@/controllers/usersController";
import { validate } from "@/middlewares/validate";
import { signupSchema } from "@/zodSchema/authSchema";
import { Router, type Router as ExpressRouter } from "express";

const usersRoutes: ExpressRouter = Router();

// Users
usersRoutes.post("/", validate(signupSchema), signupRequest);
usersRoutes.get("/", getUsers);


export default usersRoutes;
