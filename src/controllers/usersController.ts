import { db } from "@/db/db";
import type { Request, Response } from "express";

// TODO: Add pagination
export const getUsers = async (req: Request, res: Response) => {
  const users = await db.user.findMany({
    select: { id: true, name: true, email: true },
  });
  return res.json({ success: true, users });
};
