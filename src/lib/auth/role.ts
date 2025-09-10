import { AuthorizationError } from "@/lib/errors";
import { UserRole } from "@/generated/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const getSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new AuthorizationError();
  }
  return session;
};

export const requireRole = (userRole: UserRole, allowedRoles: UserRole[]) => {
  if (!allowedRoles.includes(userRole)) {
    throw new AuthorizationError("Insufficient permissions");
  }
};

export const requireSuperAdmin = async () => {
  const session = await getSession();
  requireRole(session.user.role, [UserRole.SUPER_ADMIN]);
};

export const requireSupervisor = async (organizationId?: string) => {
  const session = await getSession();
  if (organizationId) {
    if (
      session.user.organizationId !== organizationId &&
      session.user.role !== UserRole.SUPER_ADMIN
    ) {
      throw new AuthorizationError("Insufficient permissions");
    }
  }
  requireRole(session.user.role, [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.SUPERVISOR,
  ]);
};

export const requireTeamLeader = async () => {
  const session = await getSession();
  requireRole(session.user.role, [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.SUPERVISOR,
    UserRole.TEAM_LEADER,
  ]);
};

export const requireBA = (userRole: UserRole) => {
  requireRole(userRole, [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.TEAM_LEADER,
    UserRole.BA,
  ]);
};

export const requireOrganizationAccess = (
  userRole: UserRole,
  userOrganizationId: string,
  targetOrganizationId: string
) => {
  if (
    userRole !== UserRole.ADMIN &&
    userOrganizationId !== targetOrganizationId
  ) {
    throw new AuthorizationError("Organization access denied");
  }
};
