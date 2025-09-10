// create.ts
"use server";

import { revalidatePath } from "next/cache";
import { posCreateSchema, posUpdateSchema } from "@/lib/validations/pos";
import { createPos, updatePos } from "@/lib/dal/pos";
import { getSession, requireSupervisor } from "@/lib/auth/role";

export async function createPosAction(input: object) {
  try {
    const session = await getSession();
    await requireSupervisor();

    console.log({ input });

    const validatedData = posCreateSchema.parse({
      ...input,
      organizationId: session.user.organizationId,
      memberId: session.user.memberId,
    });

    // if (validatedData.baId || session.user.role === UserRole.BA) {
    //   const ba = await db.member.findUnique({
    //     where: {
    //       id: validatedData.baId || session.user.memberId,
    //       organizationId: validatedData.organizationId,
    //       role: UserRole.BA,
    //     },
    //     select: { user: true },
    //   });
    //   if (!ba) {
    //     throw new Error("BA not found");
    //   }
    //   const teamLeader = await db.member.findFirst({
    //     where: {
    //       user: {
    //         id: ba.user.teamLeaderId ?? "",
    //       },
    //     },
    //     select: { id: true },
    //   });
    //   validatedData.teamLeaderId = teamLeader?.id || "";
    // }

    const pos = await createPos(validatedData);
    revalidatePath("/pos");
    revalidatePath(`/organizations/${validatedData.organizationId}/pos`);

    return { success: true, data: pos };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

export async function updatePosAction(input: object) {
  try {
    const session = await getSession();
    await requireSupervisor();

    const validatedData = posUpdateSchema.parse({
      ...input,
      organizationId: session.user.organizationId,
      memberId: session.user.memberId,
    });

    if (session.user.organizationId !== validatedData.organizationId) {
      throw new Error("You are not authorized to update this POS");
    }

    // if (validatedData.baId || session.user.role === UserRole.BA) {
    //   const ba = await db.member.findUnique({
    //     where: {
    //       id: validatedData.baId || session.user.memberId,
    //       organizationId: validatedData.organizationId,
    //       role: UserRole.BA,
    //     },
    //     select: { user: true },
    //   });
    //   if (!ba) {
    //     throw new Error("BA not found");
    //   }
    //   const teamLeader = await db.member.findFirst({
    //     where: {
    //       user: {
    //         id: ba.user.teamLeaderId ?? "",
    //       },
    //     },
    //     select: { id: true },
    //   });
    //   validatedData.teamLeaderId = teamLeader?.id || "";
    // }

    const pos = await updatePos(validatedData.id, validatedData);
    revalidatePath("/pos");
    revalidatePath(`/organizations/${validatedData.organizationId}/pos`);

    return { success: true, data: pos };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// update.ts, delete.ts, read.ts, list.ts (similar pattern)
