import { db } from "@/db/db";
import { ApiError } from "@/middlewares/errorHandler";

export type CastVoteResult = {
  voteId: string;
  pollId: string;
  options: Array<{ id: string; text: string; votes: number }>;
};

export async function castVote(
  userId: string,
  optionId: string
): Promise<CastVoteResult> {
  const option = await db.pollOption.findUnique({
    where: { id: optionId },
    include: { poll: true },
  });
  if (!option) {
    const e = new ApiError("Option not found");
    e.code = "OPTION_NOT_FOUND";
    throw e;
  }
  const pollId = option.pollId;

  const existing = await db.vote.findFirst({
    where: {
      userId,
      option: {
        pollId,
      },
    },
  });

  if (existing) {
    const e = new ApiError("User already voted for this poll");
    e.code = "ALREADY_VOTED";
    throw e;
  }

  const vote = await db.vote.create({
    data: {
      user: { connect: { id: userId } },
      option: { connect: { id: optionId } },
    },
  });

  const options = await db.pollOption.findMany({
    where: { pollId },
    include: {
      _count: {
        select: { votes: true },
      },
    },
  });

  const mapped = options.map((o) => ({
    id: o.id,
    text: o.text,
    votes: o._count?.votes ?? 0,
  }));

  return {
    voteId: vote.id,
    pollId,
    options: mapped,
  };
}
