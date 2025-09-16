import { db } from "@/db/db";
import type { Request, Response } from "express";

// TODO: Add pagination
export const getUsers = async (req: Request, res: Response) => {
  const users = await db.user.findMany();
  return res.json(users);
};
