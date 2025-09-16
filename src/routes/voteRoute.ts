import { castVoteHandler } from "@/controllers/voteController";
import { requireAuth } from "@/middlewares/authMiddleware";
import { validate } from "@/middlewares/validate";
import { voteSchema } from "@/zodSchema/voteSchema";

import { Router, type Router as ExpressRouter } from "express";

const voteRoutes: ExpressRouter = Router();

voteRoutes.post("/", requireAuth, validate(voteSchema), castVoteHandler);

export default voteRoutes;
