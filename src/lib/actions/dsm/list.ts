// list.ts
"use server";

import { dsmListSchema } from "@/lib/validations/dsm";
import { getDsms } from "@/lib/dal/dsm";
import { getSession, requireSupervisor } from "@/lib/auth/role";

export async function getDsmsAction(input: unknown) {
  try {
    const validatedData = dsmListSchema.parse(input);
    const session = await getSession();

    await requireSupervisor(session.user.organizationId);

    const result = await getDsms(
      session.user.organizationId ?? validatedData.organizationId,
      validatedData.page,
      validatedData.limit,
      validatedData.search
    );

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
