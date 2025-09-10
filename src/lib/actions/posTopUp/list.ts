// list.ts
"use server";

import { posTopUpListSchema } from "@/lib/validations/posTopUp";
import { getPosTopUps } from "@/lib/dal/posTopUp";
import { requireSupervisor } from "@/lib/auth/role";

export async function getPosTopUpsAction(input: unknown) {
  try {
    const validatedData = posTopUpListSchema.parse(input);

    await requireSupervisor();

    const result = await getPosTopUps(validatedData);

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
