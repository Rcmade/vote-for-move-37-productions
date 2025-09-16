import {
  createPollHandler,
  getPollHandler,
  listPollsHandler,
} from "@/controllers/pollController";
import { requireAuth } from "@/middlewares/authMiddleware";
import { validate } from "@/middlewares/validate";
import { createPollSchema } from "@/zodSchema/pollSchema";

import { Router, type Router as ExpressRouter } from "express";

const pollRoutes: ExpressRouter = Router();

pollRoutes.post(
  "/",
  requireAuth,
  validate(createPollSchema),
  createPollHandler
);

pollRoutes.get("/p/:pollId", getPollHandler);

// List polls ?published=true|false (default only published)
pollRoutes.get("/", listPollsHandler);
export default pollRoutes;
