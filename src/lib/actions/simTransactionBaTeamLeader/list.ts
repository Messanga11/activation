"use server";

import { getSession, requireBA } from "@/lib/auth/role";
import { simTransactionBaTeamLeaderListSchema } from "@/lib/validations/simTransactionBaTeamLeader";
import { getSimTransactionBaTeamLeader } from "@/lib/dal/simTransactionBaTeamLeader";

export const getSimTransactionBaTeamLeaderAction = async (input: object) => {
  const session = await getSession();
  await requireBA(session.user.role);

  const validatedData = simTransactionBaTeamLeaderListSchema.parse({
    ...input,
  });

  const res = await getSimTransactionBaTeamLeader(
    validatedData.teamLeaderId,
    validatedData.page,
    validatedData.limit
  );
  return { success: true, data: res };
};
