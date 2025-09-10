import { ROUTES } from "@/config/routes";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return redirect(ROUTES.login);
  }

  if (session.user.organizationId && session.user.role !== "SUPER_ADMIN") {
    return redirect(ROUTES.organization(session.user.organizationId));
  }

  if (session.user.role !== "SUPER_ADMIN") {
    return null;
  }

  return children;
}
