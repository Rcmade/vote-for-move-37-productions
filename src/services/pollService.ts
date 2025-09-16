import { db } from "@/db/db";
import { ApiError } from "@/middlewares/errorHandler";

export async function createPoll({
  question,
  creatorId,
  options,
  isPublished = true,
}: {
  question: string;
  creatorId: string;
  options: string[];
  isPublished?: boolean;
}) {
  const user = await db.user.findUnique({ where: { id: creatorId } });
  if (!user) {
    const err = new ApiError("Creator not found");
    err.code = "CREATOR_NOT_FOUND";
    throw err;
  }

  const created = await db.poll.create({
    data: {
      question,
      isPublished,
      creator: { connect: { id: creatorId } },
      options: { create: options.map((text) => ({ text })) },
    },
    include: {
      options: true,
    },
  });

  return {
    id: created.id,
    question: created.question,
    isPublished: created.isPublished,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
    options: created.options.map((o) => ({ id: o.id, text: o.text, votes: 0 })),
  };
}

export async function getPollById(id: string) {
  const poll = await db.poll.findUnique({
    where: { id },
    include: {
      options: {
        include: {
          _count: {
            select: { votes: true },
          },
        },
      },
    },
  });

  if (!poll) return null;

  return {
    id: poll.id,
    question: poll.question,
    isPublished: poll.isPublished,
    createdAt: poll.createdAt,
    updatedAt: poll.updatedAt,
    options: poll.options.map((o) => ({
      id: o.id,
      text: o.text,
      votes: o._count?.votes ?? 0,
    })),
  };
}

export async function listPolls({
  onlyPublished = true,
}: { onlyPublished?: boolean } = {}) {
  const where = onlyPublished ? { isPublished: true } : {};
  const polls = await db.poll.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      options: {
        include: {
          _count: { select: { votes: true } },
        },
      },
    },
  });

  return polls.map((p) => ({
    id: p.id,
    question: p.question,
    isPublished: p.isPublished,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    options: p.options.map((o) => ({
      id: o.id,
      text: o.text,
      votes: o._count?.votes ?? 0,
    })),
  }));
}
