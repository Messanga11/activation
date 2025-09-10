import { z } from "zod";
import { PosType } from "@/generated/prisma";

export const posCreateSchema = z.object({
  blueNumber: z.string().min(1, "Blue number is required"),
  cni: z.string().min(1, "CNI is required"),
  address: z.string().min(1, "Address is required"),
  otherNumber: z.string().min(1, "Other number is required"),
  holderName: z.string().min(1, "Holder name is required"),
  dsmId: z.string().cuid(),
  type: z.nativeEnum(PosType),
  organizationId: z.string().cuid(),
  teamLeaderId: z.string().cuid().optional().nullable(),
  amount: z.number().nonnegative("Amount must be non-negative").default(0),
});

export const posUpdateSchema = z.object({
  id: z.string().cuid(),
  dsmId: z.string().cuid(),
  // blueNumber: z.string().min(1, "Blue number is required"),
  // cni: z.string().min(1, "CNI is required"),
  // address: z.string().min(1, "Address is required"),
  // otherNumber: z.string().min(1, "Other number is required"),
  // holderName: z.string().min(1, "Holder name is required"),
  organizationId: z.string().cuid(),
  type: z.nativeEnum(PosType),
});

export const posDeleteSchema = z.object({
  id: z.string().cuid(),
});

export const posReadSchema = z.object({
  id: z.string().cuid(),
});

export const posListSchema = z.object({
  dsmId: z.string().cuid().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});
