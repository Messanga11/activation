import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { UserRole } from "@/generated/prisma";
import { ACCESS } from "@/config/access";
export default async function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    organizationId: string;
    locale: string;
  };
}) {
  const _params = await params;
  const _headers = await headers();
  const session = await auth.api.getSession({
    headers: _headers,
  });
  const organizationId = _params.organizationId;

  if (!session) {
    return redirect(ROUTES.login);
  }

  if (session.user.role !== UserRole.SUPER_ADMIN) {
    if (!session.user.organizationId) {
      return redirect("/");
    }

    if (session.user.organizationId !== organizationId) {
      return redirect(ROUTES.organization(session.user.organizationId));
    }

    if (
      ![UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SUPERVISOR].includes(
        session.user.role as "ADMIN",
      )
    ) {
      const userRole = session.user.role;
      const access = Object.fromEntries(
        Object.entries(ACCESS[(userRole as "BA") ?? ""] ?? {}).map(
          ([key, value]) => {
            let transformedKey = key;
            Object.keys(_params).forEach((k) => {
              // @ts-expect-error
              transformedKey = transformedKey.replace(`[${k}]`, _params[k]);
            });
            return [transformedKey, value];
          },
        ),
      );
      const fullUrl = _headers.get("x-current-url");
      const path = fullUrl?.startsWith(`https`)
        ? fullUrl?.replace(
            `https://${_headers.get("host")}/${_params.locale}`,
            "",
          )
        : (fullUrl?.replace(
            `http://${_headers.get("host")}/${_params.locale}`,
            "",
          ) as keyof typeof access);
      const availableActions = access?.[path];

      if (!availableActions) {
        return [UserRole.BA, UserRole.TEAM_LEADER, UserRole.ACTIVATOR].includes(
          userRole as "BA" | "TEAM_LEADER" | "ACTIVATOR",
        )
          ? redirect(ROUTES.organizationSimSales(session.user.organizationId))
          : redirect(ROUTES.organization(session.user.organizationId));
      }
    }
  }

  return children;
}
