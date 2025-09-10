import { z } from "zod";

export const dsmCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  number: z.string().min(1, "Number is required"),
  organizationId: z.string().cuid(),
  amount: z.number().nonnegative("Amount must be non-negative"),
});

export const dsmUpdateSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1, "Name is required"),
  number: z.string().min(1, "Number is required"),
  organizationId: z.string().cuid(),
});

export const dsmDeleteSchema = z.object({
  id: z.string().cuid(),
});

export const dsmReadSchema = z.object({
  id: z.string().cuid(),
});

export const dsmListSchema = z.object({
  organizationId: z.string().cuid().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});
