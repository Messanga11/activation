// delete.ts
"use server";

import { revalidatePath } from "next/cache";
import { userDeleteSchema } from "@/lib/validations/user";
import { deleteUser } from "@/lib/dal/user";
import { getSession, requireSuperAdmin } from "@/lib/auth/role";

export async function deleteUserAction(input: unknown) {
  try {
    const validatedData = userDeleteSchema.parse(input);
    const session = await getSession();

    await requireSuperAdmin();

    await deleteUser(validatedData.id);
    revalidatePath("/users");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
