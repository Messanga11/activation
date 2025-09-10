// create.ts
"use server";

import { revalidatePath } from "next/cache";
import { simOrganizationTransactionCreateSchema } from "@/lib/validations/simOrganizationTransaction";
import { createSimOrganizationTransaction } from "@/lib/dal/simOrganizationTransaction";
import { getSession, requireSupervisor } from "@/lib/auth/role";

export async function createSimOrganizationTransactionAction(input: object) {
  try {
    const session = await getSession();

    const validatedData = simOrganizationTransactionCreateSchema.parse({
      ...input,
      quantity: Number(
        (input as { quantity: string }).quantity.replace(/\D/g, "")
      ),
      memberId: session.user.memberId,
      organizationId: session.user.organizationId,
    });

    await requireSupervisor();

    const transaction = await createSimOrganizationTransaction(validatedData);
    revalidatePath("/sim-organization-transactions");
    revalidatePath(`/organizations/${validatedData.organizationId}`);

    return { success: true, data: transaction };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// read.ts and list.ts similar to previous patterns
