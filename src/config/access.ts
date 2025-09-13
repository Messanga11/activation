import { UserRole } from "@/generated/prisma";
import { ROUTES } from "./routes";

export const ACCESS = {
  [UserRole.SUPER_ADMIN]: "all",
  [UserRole.ADMIN]: "all",
  [UserRole.SUPERVISOR]: "all",
  [UserRole.BA]: {
    [ROUTES.organizationSimSales("[organizationId]")]: {
      create: true,
      read: true,
      update: false,
      delete: false,
      export: false,
    },
    [ROUTES.organizationTransactionSimBa("[organizationId]")]: {
      read: true,
    },
  },
  [UserRole.TEAM_LEADER]: {
    [ROUTES.organizationSimSales("[organizationId]")]: {
      read: true,
    },
    [ROUTES.organizationTransactionSimBa("[organizationId]")]: {
      create: true,
    },
    [ROUTES.organizationTransactionSimTeamLeader("[organizationId]")]: {
      create: false,
    },
  },
  [UserRole.ACTIVATOR]: {
    [ROUTES.organizationSimSales("[organizationId]")]: {
      read: true,
    },
  },
};
