import { db } from "@/lib/db";
import type { PosType } from "@/generated/prisma";
import { NotFoundError } from "@/lib/errors";

export const createPos = async (data: {
  blueNumber: string;
  cni: string;
  address: string;
  otherNumber: string;
  holderName: string;
  dsmId: string;
  type: PosType;
  organizationId: string;
  amount: number;
}) => {
  // Check if DSM, organization, BA and Team Leader exist
  const [dsm, organization] = await Promise.all([
    db.dsm.findUnique({ where: { id: data.dsmId } }),
    db.organization.findUnique({ where: { id: data.organizationId } }),
    // db.member.findUnique({ where: { id: data.baId }, select: { user: true } }),
  ]);

  // const teamLeader = await db.member.findFirst({
  //   where: { user: { id: ba?.user.teamLeaderId ?? "" } },
  //   select: { user: true, id: true },
  // });

  if (!dsm) throw new NotFoundError("DSM");
  if (!organization) throw new NotFoundError("Organization");
  // if (!ba) throw new NotFoundError("BA");
  // if (!teamLeader) throw new NotFoundError("Team Leader");

  return await db.pos.create({
    data,
    include: {
      dsm: true,
      organization: true,
      topUps: true,
    },
  });
};

export const updatePos = async (
  id: string,
  data: Partial<{
    blueNumber: string;
    cni: string;
    address: string;
    otherNumber: string;
    holderName: string;
    dsmId: string;
    type: PosType;
    amount: number;
  }>
) => {
  const pos = await db.pos.findUnique({ where: { id } });
  if (!pos) throw new NotFoundError("POS");

  return await db.pos.update({
    where: { id },
    data,
    include: {
      dsm: true,
      organization: true,
      topUps: {
        include: {
          member: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });
};

export const deletePos = async (id: string) => {
  const pos = await db.pos.findUnique({ where: { id } });
  if (!pos) throw new NotFoundError("POS");

  return await db.pos.delete({ where: { id } });
};

export const getPos = async (id: string) => {
  const pos = await db.pos.findUnique({
    where: { id },
    include: {
      dsm: true,
      organization: true,
      topUps: {
        include: {
          member: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });
  if (!pos) throw new NotFoundError("POS");

  return pos;
};

export const getPosList = async (
  organizationId?: string,
  dsmId?: string,
  page: number = 1,
  limit: number = 20,
  search?: string
) => {
  const skip = (page - 1) * limit;

  const where: any = {};
  if (organizationId) where.organizationId = organizationId;
  if (dsmId) where.dsmId = dsmId;

  if (search) {
    where.OR = [
      { blueNumber: { contains: search, mode: "insensitive" } },
      { holderName: { contains: search, mode: "insensitive" } },
      { cni: { contains: search, mode: "insensitive" } },
    ];
  }

  const [posList, total] = await Promise.all([
    db.pos.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        dsm: true,
        organization: true,
        _count: {
          select: {
            topUps: true,
          },
        },
      },
    }),
    db.pos.count({ where }),
  ]);

  return {
    data: posList,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
