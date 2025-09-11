import { db } from "@/lib/db";
import { NotFoundError, InsufficientStockError } from "@/lib/errors";
import { getSession } from "../auth/role";
import { UserRole } from "@/generated/prisma";

export const createSimOrganizationTransaction = async (data: {
  range: string;
  quantity: number;
  organizationId: string;
  memberId: string;
  teamLeaderId: string;
}) => {
  return await db.$transaction(
    async (tx) => {
      const [organization, member, teamLeader] = await Promise.all([
        tx.organization.findUnique({ where: { id: data.organizationId } }),
        tx.member.findUnique({ where: { id: data.memberId } }),
        tx.member.findUnique({ where: { id: data.teamLeaderId } }),
      ]);

      if (!organization) throw new NotFoundError("Organization");
      if (!member) throw new NotFoundError("Member");
      if (!teamLeader) throw new NotFoundError("Team Leader");

      // Check if organization has enough SIMs
      if (
        organization.simCount !== null &&
        organization.simCount < data.quantity
      ) {
        throw new InsufficientStockError("SIM");
      }

      // Update organization SIM count
      await tx.organization.update({
        where: { id: organization.id },
        data: { simCount: (organization.simCount || 0) - data.quantity },
      });

      // await tx.member.update({
      //   where: { id: member.id },
      //   data: { simCount: (member.simCount || 0) + data.quantity },
      // });

      await tx.member.update({
        where: { id: teamLeader.id },
        data: { simCount: (teamLeader.simCount || 0) + data.quantity },
      });

      return await tx.simOrganizationTransaction.create({
        data,
        include: {
          organization: true,
          member: {
            include: {
              user: true,
            },
          },
          teamLeader: {
            include: {
              user: true,
            },
          },
        },
      });
    },
    {
      timeout: 10000,
    }
  );
};

export const getSimOrganizationTransactions = async (
  organizationId: string,
  page: number,
  limit: number,
  search?: string
) => {
  const skip = (page - 1) * limit;

  const session = await getSession();

  const where: any = {};
  if (organizationId) where.organizationId = organizationId;

  if (session.user.role === UserRole.TEAM_LEADER) {
    where.teamLeaderId = session.user.memberId;
  }

  if (search) {
    where.OR = [{ range: { contains: search, mode: "insensitive" } }];
  }

  const [dsms, total] = await Promise.all([
    db.simOrganizationTransaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        organization: true,
        member: {
          include: {
            user: true,
          },
        },
        teamLeader: {
          include: {
            user: true,
          },
        },
      },
    }),
    db.simOrganizationTransaction.count({ where }),
  ]);

  return {
    data: dsms,
    total,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
