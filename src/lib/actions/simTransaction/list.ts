"use server";

import { getSimTransactions } from "@/lib/dal/simTransaction";
import { getSession, requireSupervisor } from "@/lib/auth/role";
import { simTransactionListSchema } from "@/lib/validations/simTransaction";

export const getSimTransactionsAction = async (input: object) => {
  const session = await getSession();
  await requireSupervisor(session.user.organizationId);
  const validatedData = simTransactionListSchema.parse({
    ...input,
  });

  const res = await getSimTransactions(
    validatedData.memberId,
    validatedData.page,
    validatedData.limit
  );
  return { success: true, data: res };
};
