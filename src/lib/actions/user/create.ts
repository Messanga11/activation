// create.ts
"use server";

import { revalidatePath } from "next/cache";
import { userCreateSchema } from "@/lib/validations/user";
import { createUser } from "@/lib/dal/user";
import { getSession, requireSuperAdmin } from "@/lib/auth/role";

export async function createUserAction(input: unknown) {
  try {
    const validatedData = userCreateSchema.parse(input);
    const session = await getSession();

    await requireSuperAdmin();

    const user = await createUser(validatedData);
    revalidatePath("/users");

    return { success: true, data: user };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
