// create.ts
"use server";

import { revalidatePath } from "next/cache";
import { memberCreateSchema } from "@/lib/validations/member";
import { getMemberByUserAndOrg, updateMember } from "@/lib/dal/member";
import { getSession } from "@/lib/auth/role";
import { UserRole } from "@/generated/prisma";
import { AuthorizationError } from "@/lib/errors";

export async function updateMemberAction(input: unknown) {
  try {
    const validatedData = memberCreateSchema.parse(input);
    const session = await getSession();

    const organizationId = session.user.organizationId;
    if (!organizationId) {
      throw new AuthorizationError();
    }

    // Check if user is super admin or organization owner
    if (session.user.role !== UserRole.SUPER_ADMIN) {
      // For non-super admins, check if they're a member of the organization
      const userMembership = await getMemberByUserAndOrg(
        session.user.id,
        organizationId
      );
      if (!userMembership || userMembership.role !== UserRole.ADMIN) {
        throw new AuthorizationError();
      }
    }

    const member = await updateMember({
      ...validatedData,
      organizationId,
    });
    revalidatePath("/members");
    revalidatePath(`/organizations/${organizationId}/members`);

    return { success: true, data: member };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// Other actions follow similar pattern
