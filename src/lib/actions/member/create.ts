// create.ts
"use server";

import { revalidatePath } from "next/cache";
import { memberCreateSchema } from "@/lib/validations/member";
import { createMember } from "@/lib/dal/member";
import { getSession, requireSupervisor } from "@/lib/auth/role";
import { UserRole } from "@/generated/prisma";
import { db } from "@/lib/db";

export async function createMemberAction(input: unknown) {
  console.log({ input });
  try {
    const validatedData = memberCreateSchema.parse(input);
    const session = await getSession();

    const organizationId = session.user.organizationId;

    if (!organizationId) {
      throw new Error("Organization ID is required");
    }

    await requireSupervisor(organizationId);

    if (validatedData.role === UserRole.BA) {
      if (!validatedData.teamLeaderId) {
        throw new Error("Team Leader is required");
      }
      const teamLeader = await db.member.findFirst({
        where: {
          user: {
            id: validatedData.teamLeaderId,
          },
          organizationId,
        },
        select: { user: true },
      });
      if (!teamLeader) {
        throw new Error("Team Leader not found");
      }
    }

    const member = await createMember({
      ...validatedData,
      organizationId,
      teamLeaderId: validatedData.teamLeaderId ?? null,
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
