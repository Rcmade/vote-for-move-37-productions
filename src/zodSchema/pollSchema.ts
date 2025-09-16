import { array, boolean, object, string, type z } from "zod";

export const createPollSchema = object({
  question: string().min(1, "Question is required"),
  options: array(string().min(1, "Option text must not be empty")).min(
    1,
    "At least one option is required"
  ),
  isPublished: boolean().optional().default(true),
});
export type CreatePollSchemaT = z.infer<typeof createPollSchema>;
