import { ApiError } from "@/middlewares/errorHandler";
import * as voteService from "@/services/voteService";
import { emitVoteUpdate } from "@/socket";
import { VoteSchemaT } from "@/zodSchema/voteSchema";
import { NextFunction, Request, Response } from "express";

export async function castVoteHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const body = res.locals.validated as VoteSchemaT;
    if (!body) return next(new ApiError("Missing request body", 400));

    const userId = req.user?.id;
    if (!userId) return next(new ApiError("Authentication required", 401));

    // Cast vote
    try {
      const result = await voteService.castVote(userId, body.optionId);

      await emitVoteUpdate(result.pollId, result.options);

      return res.status(201).json({ ok: true, voteId: result.voteId });
    } catch (err: any) {
      if (err?.code === "OPTION_NOT_FOUND") {
        return next(new ApiError("Option not found", 404, "OPTION_NOT_FOUND"));
      }
      if (err?.code === "ALREADY_VOTED") {
        return next(
          new ApiError("User already voted for this poll", 409, "ALREADY_VOTED")
        );
      }
      if (err?.code === "P2002") {
        return next(new ApiError("Duplicate vote", 409, "DUPLICATE_VOTE"));
      }
      return next(err);
    }
  } catch (err) {
    return next(err);
  }
}
