// read.ts
"use server";

import { userReadSchema } from "@/lib/validations/user";
import { getUser } from "@/lib/dal/user";
import { getSession, requireSuperAdmin } from "@/lib/auth/role";

export async function getUserAction(input: unknown) {
  try {
    const validatedData = userReadSchema.parse(input);
    const session = await getSession();

    await requireSuperAdmin();

    const user = await getUser(validatedData.id);

    return { success: true, data: user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
