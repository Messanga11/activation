// update.ts
"use server";

import { revalidatePath } from "next/cache";
import { userUpdateSchema } from "@/lib/validations/user";
import { updateUser } from "@/lib/dal/user";
import { getSession, requireSuperAdmin } from "@/lib/auth/role";

export async function updateUserAction(input: unknown) {
  try {
    const validatedData = userUpdateSchema.parse(input);
    const session = await getSession();

    await requireSuperAdmin();

    const user = await updateUser(validatedData.id, validatedData);
    revalidatePath("/users");
    revalidatePath(`/users/${validatedData.id}`);

    return { success: true, data: user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
