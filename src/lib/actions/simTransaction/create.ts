// create.ts
"use server";

import { revalidatePath } from "next/cache";
import { simTransactionCreateSchema } from "@/lib/validations/simTransaction";
import { createSimTransaction } from "@/lib/dal/simTransaction";
import { getSession, requireSupervisor } from "@/lib/auth/role";

export async function createSimTransactionAction(input: object) {
  try {
    const session = await getSession();

    await requireSupervisor();

    const validatedData = simTransactionCreateSchema.parse({
      ...input,
      quantity: Number(
        (input as { quantity: string }).quantity.replace(/\D/g, "")
      ),
      memberId: session.user.memberId,
    });

    await requireSupervisor();

    const simTransaction = await createSimTransaction(validatedData);
    revalidatePath("/sim-transactions");
    revalidatePath(`/members/${validatedData.memberId}`);

    return { success: true, data: simTransaction };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// read.ts and list.ts similar to previous patterns
