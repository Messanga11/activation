// read.ts
"use server";

import { posTopUpReadSchema } from "@/lib/validations/posTopUp";
import { getPosTopUp } from "@/lib/dal/posTopUp";
import { getSession, requireSupervisor } from "@/lib/auth/role";

export async function getPosTopUpAction(input: unknown) {
  try {
    const validatedData = posTopUpReadSchema.parse(input);
    const session = await getSession();

    await requireSupervisor();

    const posTopUp = await getPosTopUp(validatedData.id);

    return { success: true, data: posTopUp };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
