import { object, string, type z } from "zod";

export const voteSchema = object({
  optionId: string().uuid("optionId must be a valid UUID"),
});

export type VoteSchemaT = z.infer<typeof voteSchema>;
