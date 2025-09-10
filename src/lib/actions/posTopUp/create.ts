// create.ts
"use server";

import { revalidatePath } from "next/cache";
import { posTopUpCreateSchema } from "@/lib/validations/posTopUp";
import { createPosTopUp } from "@/lib/dal/posTopUp";
import { getSession, requireSupervisor } from "@/lib/auth/role";
import { db } from "@/lib/db";

export async function createPosTopUpAction(input: object) {
  try {
    const session = await getSession();
    await requireSupervisor();

    const validatedData = posTopUpCreateSchema.parse({
      ...input,
      amount: Number((input as { amount: string }).amount.replace(/\D/g, "")),
      memberId: session.user.memberId,
    });

    const dsm = await db.dsm.findUnique({
      where: {
        id: validatedData.dsmId,
        organizationId: session.user.organizationId,
      },
      select: { amount: true },
    });

    if (!dsm) {
      throw new Error("DSM not found");
    }

    const posTopUp = await createPosTopUp({
      ...validatedData,
      previousAmount: dsm.amount,
    });

    revalidatePath("/pos-top-ups");
    revalidatePath(`/dsms/${validatedData.dsmId}`);
    revalidatePath(`/pos/${validatedData.posId}`);

    return { success: true, data: posTopUp };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
