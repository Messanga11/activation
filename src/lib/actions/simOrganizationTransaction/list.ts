"use server";

import { requireTeamLeader } from "@/lib/auth/role";
import { simOrganizationTransactionListSchema } from "@/lib/validations/simOrganizationTransaction";
import { getSimOrganizationTransactions } from "@/lib/dal/simOrganizationTransaction";

export const getSimOrganizationTransactionsAction = async (input: object) => {
  const validatedData = simOrganizationTransactionListSchema.parse({
    ...input,
  });
  await requireTeamLeader();

  if (!validatedData.organizationId) {
    throw new Error("Organization ID is required");
  }

  const res = await getSimOrganizationTransactions(
    validatedData.organizationId,
    validatedData.page,
    validatedData.limit,
    validatedData.search
  );
  return { success: true, data: res };
};
