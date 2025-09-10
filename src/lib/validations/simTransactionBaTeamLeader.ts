import { z } from "zod";

export const simTransactionBaTeamLeaderCreateSchema = z.object({
  range: z.string().min(1, "Range is required"),
  quantity: z.number().int().positive("Quantity must be positive"),
  memberId: z.string().cuid(),
  teamLeaderId: z.string().cuid().optional(),
  baId: z.string().cuid(),
});

export const simTransactionBaTeamLeaderReadSchema = z.object({
  id: z.string().cuid(),
});

export const simTransactionBaTeamLeaderListSchema = z.object({
  teamLeaderId: z.string().cuid().optional(),
  baId: z.string().cuid().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});
