import { UserRole } from "@/generated/prisma";
import { authClient } from "@/lib/auth-client";
import { db } from "@/lib/db";

export const seed = async () => {
  const user = await db.user.findFirst({
    where: {
      email: "bekonodominique@gmail.com",
    },
  });

  if (user) {
    return;
  }

  const { data, error } = await authClient.signUp.email({
    email: "bekonodominique@gmail.com",
    name: "Bekono Dominique",
    password: "password",
  });

  if (error) {
    throw new Error(JSON.stringify(error));
  }

  if (!data?.user?.id) {
    throw new Error("User not created");
  }

  await db.user.update({
    where: {
      id: data?.user?.id,
    },
    data: {
      role: UserRole.SUPER_ADMIN,
    },
  });

  const metadata = { someKey: "someValue" };
  await authClient.organization.create({
    name: "My Organization", // required
    slug: "my-org", // required
    logo: "https://example.com/logo.png",
    metadata,
    keepCurrentActiveOrganization: false,
    userId: data?.user?.id,
  });
};

seed();
