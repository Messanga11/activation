"use server";

import { getSession, requireTeamLeader } from "@/lib/auth/role";
import { getMembers } from "@/lib/dal/member";
import { memberListSchema } from "@/lib/validations/member";

export const listMembersAction = async (input: unknown) => {
  try {
    const validatedData = memberListSchema.parse(input);
    const session = await getSession();
    const organizationId = session.user.organizationId;

    await requireTeamLeader();

    const members = await getMembers(
      organizationId,
      validatedData.page,
      validatedData.limit,
      validatedData.search,
      validatedData.role
    );
    return { success: true, data: members };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
};
