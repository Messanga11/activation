// list.ts
"use server";

import { userListSchema } from "@/lib/validations/user";
import { getUsers } from "@/lib/dal/user";
import { getSession, requireSuperAdmin } from "@/lib/auth/role";

export async function getUsersAction(input: unknown) {
  try {
    const validatedData = userListSchema.parse(input);
    const session = await getSession();

    await requireSuperAdmin();

    const result = await getUsers(
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
