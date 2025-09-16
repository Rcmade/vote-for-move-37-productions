// src/services/authService.ts
import { db } from "@/db/db";
import bcrypt from "bcryptjs";

export type CreateUserArgs = {
  name: string;
  email: string;
  password: string;
};

export async function createUser({ name, email, password }: CreateUserArgs) {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
    select: { id: true, name: true, email: true },
  });

  return user;
}

export async function findUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email },
  });
}

export async function validatePassword(plain: string, hashed: string) {
  return bcrypt.compare(plain, hashed);
}
