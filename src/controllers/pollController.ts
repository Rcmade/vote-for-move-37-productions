import { ApiError } from "@/middlewares/errorHandler";
import * as pollService from "@/services/pollService";
import { CreatePollSchemaT } from "@/zodSchema/pollSchema";
import { NextFunction, Request, Response } from "express";

export async function createPollHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const body = res.locals.validated as CreatePollSchemaT;
    if (!body) return next(new ApiError("Missing request body", 400));
    if (!req.user) return next(new ApiError("Unauthorized", 401));

    const created = await pollService.createPoll({
      question: body.question,
      creatorId: req.user.id,
      options: body.options,
      isPublished: body.isPublished ?? true,
    });

    return res.status(201).json({ success: true, poll: created });
  } catch (err) {
    return next(err);
  }
}

export async function getPollHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.pollId as string;
    const poll = await pollService.getPollById(id);
    if (!poll)
      return next(new ApiError("Poll not found", 404, "POLL_NOT_FOUND"));

    return res.json({ success: true, poll });
  } catch (err) {
    return next(err);
  }
}

export async function listPollsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // allow optional query ?published=true|false
    const publishedQuery = req.query.published;
    const onlyPublished =
      publishedQuery === undefined ? true : String(publishedQuery) === "true";

    const polls = await pollService.listPolls({ onlyPublished });

    return res.json({ success: true, polls });
  } catch (err) {
    return next(err);
  }
}
