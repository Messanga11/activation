import { z } from "zod";

export const simOrganizationTransactionCreateSchema = z.object({
  range: z.string().min(1, "Range is required"),
  quantity: z.number().int().positive("Quantity must be positive"),
  organizationId: z.string().cuid(),
  memberId: z.string().cuid(),
  teamLeaderId: z.string().cuid(),
});

export const simOrganizationTransactionReadSchema = z.object({
  id: z.string().cuid(),
});

export const simOrganizationTransactionListSchema = z.object({
  organizationId: z.string().cuid().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});
