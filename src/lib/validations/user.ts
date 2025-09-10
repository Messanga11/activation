import { z } from "zod";
import { UserRole } from "@/generated/prisma";

export const userCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  role: z.nativeEnum(UserRole).default(UserRole.BA),
  teamLeaderId: z.string().cuid().optional().nullable(),
  image: z.string().url().optional().nullable(),
});

export const userUpdateSchema = userCreateSchema.partial().extend({
  id: z.string().cuid(),
});

export const userDeleteSchema = z.object({
  id: z.string().cuid(),
});

export const userReadSchema = z.object({
  id: z.string().cuid(),
});

export const userListSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});
