import { object, string, type z } from "zod";

const authObj = {
  name: string().min(2, "Name must be at least 2 characters"),
  email: string().email("Enter a valid email"),
  password: string().min(6, "Password must be at least 6 characters"),
};

export const signupSchema = object({
  ...authObj,
});
export type SignupSchemaT = z.infer<typeof signupSchema>;

export const loginSchema = object({
  email: authObj.email,
  password: string().min(1, "Password is required"),
});
export type LoginSchemaT = z.infer<typeof loginSchema>;
