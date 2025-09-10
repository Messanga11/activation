import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { headers } from "next/headers";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    return redirect(ROUTES.dashboard);
  }

  return children;
}
