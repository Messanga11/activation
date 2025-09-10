// create.ts
"use server";

import { revalidatePath } from "next/cache";
import { dsmTopUpCreateSchema } from "@/lib/validations/dsmTopUp";
import { createDsmTopUp } from "@/lib/dal/dsmTopUp";
import { getSession, requireSupervisor } from "@/lib/auth/role";

export async function createDsmTopUpAction(input: object) {
  try {
    const session = await getSession();

    await requireSupervisor();
    const validatedData = dsmTopUpCreateSchema.parse({
      ...input,
      amount: Number((input as { amount: number }).amount),
      memberId: session.user.memberId,
    });

    const dsmTopUp = await createDsmTopUp(validatedData);
    revalidatePath("/dsm-top-ups");
    revalidatePath(`/dsms/${validatedData.dsmId}`);

    return { success: true, data: dsmTopUp };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
