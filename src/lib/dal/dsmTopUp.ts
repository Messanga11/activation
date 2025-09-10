import { db } from "@/lib/db";
import { NotFoundError, InsufficientStockError } from "@/lib/errors";

export const createDsmTopUp = async (data: {
  amount: number;
  dsmId: string;
  memberId: string;
  observations?: string;
}) => {
  return await db.$transaction(async (tx) => {
    // Check if DSM and member exist
    const [dsm, member] = await Promise.all([
      tx.dsm.findUnique({ where: { id: data.dsmId } }),
      tx.member.findUnique({ where: { id: data.memberId } }),
    ]);

    if (!dsm) throw new NotFoundError("Master");
    if (!member) throw new NotFoundError("Member");

    // Update DSM amount
    await tx.dsm.update({
      where: { id: dsm.id },
      data: { amount: dsm.amount + data.amount },
    });

    // Create the top-up
    return await tx.dsmTopUp.create({
      data: {
        ...data,
        previousAmount: dsm.amount,
      },
      include: {
        dsm: true,
        member: {
          include: {
            user: true,
          },
        },
      },
    });
  });
};

export const getDsmTopUp = async (id: string) => {
  const dsmTopUp = await db.dsmTopUp.findUnique({
    where: { id },
    include: {
      dsm: {
        include: {
          organization: true,
        },
      },
      member: {
        include: {
          user: true,
        },
      },
    },
  });
  if (!dsmTopUp) throw new NotFoundError("Master Top-Up");

  return dsmTopUp;
};

export const getDsmTopUps = async (
  dsmId?: string,
  page: number = 1,
  limit: number = 20
) => {
  const skip = (page - 1) * limit;

  const where = dsmId ? { dsmId } : {};

  const [dsmTopUps, total] = await Promise.all([
    db.dsmTopUp.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        dsm: {
          include: {
            organization: true,
          },
        },
        member: {
          include: {
            user: true,
          },
        },
      },
    }),
    db.dsmTopUp.count({ where }),
  ]);

  return {
    data: dsmTopUps,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
