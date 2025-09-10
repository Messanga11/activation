import { z } from "zod";
import { userCreateSchema } from "./user";
import { UserRole } from "@/generated/prisma";

export const memberCreateSchema = userCreateSchema.extend({
  role: z.nativeEnum(UserRole).default(UserRole.BA),
  cni: z.string().min(1, "CNI is required"),
  blueNumber: z.string().min(1, "Blue number is required"),
  otherNumber: z.string().min(1, "Other number is required"),
  password: z.string().min(8),
  teamLeaderId: z.string().cuid().optional().nullable(),
});

export const memberUpdateSchema = memberCreateSchema.partial().extend({
  id: z.string().cuid(),
});

export const memberDeleteSchema = z.object({
  id: z.string().cuid(),
});

export const memberReadSchema = z.object({
  id: z.string().cuid(),
});

export const memberListSchema = z.object({
  organizationId: z.string().cuid().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
});
