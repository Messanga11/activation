import { UserRole } from "@/generated/prisma";
import { db } from "@/lib/db";
import { InsufficientStockError, NotFoundError } from "@/lib/errors";

export const createSimSale = async (data: {
  organizationId: string;
  blueNumber: string;
  otherNumber: string;
  customerName: string;
  cni: string;
  address: string;
  imei: string;
  iccid: string;
  baId: string;
}) => {
  // Check if organization, BA and Team Leader exist
  const [organization, ba] = await Promise.all([
    db.organization.findUnique({ where: { id: data.organizationId } }),
    db.member.findFirst({
      where: { user: { id: data.baId } },
      select: { user: true, id: true },
    }),
  ]);

  if (!organization) throw new NotFoundError("Organization");
  if (!ba) throw new NotFoundError("BA");

  const teamLeader = await db.member.findFirst({
    where: { user: { id: ba.user.teamLeaderId ?? "" } },
    select: { user: true, id: true },
  });

  if (!teamLeader) throw new NotFoundError("Team Leader");

  return await db.$transaction(async (tx) => {
    const baMember = await tx.member.findUnique({ where: { id: ba.id } });

    const baSimCount = baMember?.simCount ?? 0;

    if (baSimCount < 1) {
      throw new InsufficientStockError("BA");
    }

    await tx.member.update({
      where: { id: ba.id },
      data: { simCount: baSimCount - 1 },
    });

    await tx.simSale.create({
      data: {
        ...data,
        baId: ba.id,
        teamLeaderId: teamLeader.id,
      },
      include: {
        organization: true,
        ba: {
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
  });
};

export const updateSimSale = async (
  id: string,
  data: Partial<{
    blueNumber: string;
    otherNumber: string;
    customerName: string;
    cni: string;
    address: string;
    imei: string;
    iccid: string;
    baId: string;
    teamLeaderId: string;
  }>
) => {
  const simSale = await db.simSale.findUnique({ where: { id } });
  if (!simSale) throw new NotFoundError("Sim Sale");

  return await db.simSale.update({
    where: { id },
    data,
    include: {
      organization: true,
      ba: {
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
};

export const deleteSimSale = async (id: string) => {
  const simSale = await db.simSale.findUnique({ where: { id } });
  if (!simSale) throw new NotFoundError("Sim Sale");

  return await db.simSale.delete({ where: { id } });
};

export const getSimSale = async (id: string) => {
  const simSale = await db.simSale.findUnique({
    where: { id },
    include: {
      organization: true,
      ba: {
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
  if (!simSale) throw new NotFoundError("Sim Sale");

  return simSale;
};

export const getSimSales = async (
  organizationId?: string,
  page: number = 1,
  limit: number = 20,
  search?: string,
  userId?: string
) => {
  const skip = (page - 1) * limit;

  // biome-ignore lint/suspicious/noExplicitAny: can't find a better way
  const where: any = {};
  if (organizationId) where.organizationId = organizationId;

  if (userId) {
    const member = await db.member.findFirst({
      where: { user: { id: userId } },
    });
    if (!member) throw new NotFoundError("Member");
    if (member.role === UserRole.BA) where.baId = member.id;
    if (member.role === UserRole.TEAM_LEADER) where.teamLeaderId = member.id;
  }

  if (search) {
    where.OR = [
      { customerName: { contains: search, mode: "insensitive" } },
      { blueNumber: { contains: search, mode: "insensitive" } },
      { otherNumber: { contains: search, mode: "insensitive" } },
      { cni: { contains: search, mode: "insensitive" } },
    ];
  }

  const [simSales, total] = await Promise.all([
    db.simSale.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        organization: true,
        ba: {
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
    db.simSale.count({ where }),
  ]);

  return {
    data: simSales,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
