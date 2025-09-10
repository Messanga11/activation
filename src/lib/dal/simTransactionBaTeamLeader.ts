import { db } from "@/lib/db";
import { NotFoundError, InsufficientStockError } from "@/lib/errors";
import { getSession } from "@/lib/auth/role";
import { UserRole } from "@/generated/prisma";

export const createSimTransactionBaTeamLeader = async (data: {
  range: string;
  quantity: number;
  memberId: string;
  teamLeaderId?: string;
  baId: string;
}) => {
  const session = await getSession();

  if (session.user.role === UserRole.TEAM_LEADER) {
    data.teamLeaderId = session.user.memberId;
  } else {
    if (!data.teamLeaderId) throw new Error("Team Leader ID is required");
  }

  if (!data.teamLeaderId) throw new Error("Team Leader ID is required");

  return await db.$transaction(async (tx) => {
    const [member, teamLeader, ba] = await Promise.all([
      tx.member.findUnique({ where: { id: data.memberId } }),
      tx.member.findUnique({ where: { id: data.teamLeaderId } }),
      tx.member.findUnique({ where: { id: data.baId } }),
    ]);

    if (!member) throw new NotFoundError("Member");
    if (!teamLeader) throw new NotFoundError("Team Leader");
    if (!ba) throw new NotFoundError("BA");

    // Check if team leader has enough SIMs
    if (teamLeader.simCount !== null && teamLeader.simCount < data.quantity) {
      throw new InsufficientStockError("SIM");
    }

    // Update team leader SIM count
    if (teamLeader.simCount !== null) {
      await tx.member.update({
        where: { id: teamLeader.id },
        data: { simCount: teamLeader.simCount - data.quantity },
      });
    }

    // Update BA SIM count
    if (ba.simCount !== null) {
      await tx.member.update({
        where: { id: ba.id },
        data: { simCount: ba.simCount + data.quantity },
      });
    }

    return await tx.simTransactionBaTeamLeader.create({
      data: {
        ...data,
        teamLeaderId: data.teamLeaderId ?? "",
        memberId: session.user.memberId ?? "",
        baId: data.baId,
      },
      include: {
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
        ba: {
          include: {
            user: true,
          },
        },
      },
    });
  });
};

export const getSimTransactionBaTeamLeader = async (
  teamLeaderId?: string,
  page?: number,
  limit?: number
) => {
  if (!page) page = 1;
  if (!limit) limit = 10;

  const where: any = {};
  if (teamLeaderId) where.teamLeaderId = teamLeaderId;

  const [result, total] = await Promise.all([
    await db.simTransactionBaTeamLeader.findMany({
      where,
      include: {
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
        ba: {
          include: {
            user: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    await db.simTransactionBaTeamLeader.count({
      where,
    }),
  ]);

  return {
    data: result,
    total,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
