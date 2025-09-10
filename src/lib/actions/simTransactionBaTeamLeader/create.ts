// create.ts
"use server";

import { revalidatePath } from "next/cache";
import { createSimTransactionBaTeamLeader } from "@/lib/dal/simTransactionBaTeamLeader";
import { getSession, requireTeamLeader } from "@/lib/auth/role";
import { simTransactionBaTeamLeaderCreateSchema } from "@/lib/validations/simTransactionBaTeamLeader";

export async function createSimTransactionBaTeamLeaderAction(input: object) {
  try {
    const session = await getSession();

    const validatedData = simTransactionBaTeamLeaderCreateSchema.parse({
      ...input,
      quantity: Number(
        (input as { quantity: string }).quantity.replace(/\D/g, "")
      ),
      memberId: session.user.memberId,
    });

    await requireTeamLeader();

    const transaction = await createSimTransactionBaTeamLeader(validatedData);
    revalidatePath("/sim-transactions-ba-team-leader");
    revalidatePath(`/members/${validatedData.teamLeaderId}`);
    revalidatePath(`/members/${validatedData.baId}`);

    return { success: true, data: transaction };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// read.ts and list.ts similar to previous patterns
