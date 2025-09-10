import { TRANSACTIONS } from "@/config/transactions";
import { db } from "@/lib/db";
import { NotFoundError, InsufficientStockError } from "@/lib/errors";

export const createPosTopUp = async (data: {
  amount: number;
  dsmId: string;
  memberId: string;
  posId: string;
  observations?: string;
  previousAmount: number;
}) => {
  return await db.$transaction(async (tx) => {
    // Check if DSM, POS and member exist
    const [dsm, pos, member] = await Promise.all([
      tx.dsm.findUnique({ where: { id: data.dsmId } }),
      tx.pos.findUnique({ where: { id: data.posId } }),
      tx.member.findUnique({ where: { id: data.memberId } }),
    ]);

    if (!dsm) throw new NotFoundError("Master");
    if (!pos) throw new NotFoundError("DSM");
    if (!member) throw new NotFoundError("Member");

    // Check if DSM has enough amount
    const rate = TRANSACTIONS.rates[pos.type];
    const amount = data.amount * (1 + rate);
    if (dsm.amount < amount) {
      throw new InsufficientStockError(`${dsm.name} (${dsm.amount})`);
    }

    // Update DSM amount
    await tx.dsm.update({
      where: { id: dsm.id },
      data: { amount: dsm.amount - amount },
    });

    // Update POS amount
    await tx.pos.update({
      where: { id: pos.id },
      data: { amount: pos.amount + amount },
    });

    // Create the top-up
    return await tx.posTopUp.create({
      data: {
        ...data,
        previousAmount: pos.amount,
        rate,
      },
      include: {
        dsm: true,
        pos: true,
        member: {
          include: {
            user: true,
          },
        },
      },
    });
  });
};

export const getPosTopUp = async (id: string) => {
  const posTopUp = await db.posTopUp.findUnique({
    where: { id },
    include: {
      dsm: {
        include: {
          organization: true,
        },
      },
      pos: true,
      member: {
        include: {
          user: true,
        },
      },
    },
  });
  if (!posTopUp) throw new NotFoundError("POS Top-Up");

  return posTopUp;
};

export const getPosTopUps = async ({
  posId,
  dsmId,
  page,
  limit,
  startDate,
  endDate,
}: {
  posId?: string;
  dsmId?: string;
  page: number;
  limit: number;
  startDate?: string;
  endDate?: string;
}) => {
  const skip = (page - 1) * limit;

  const where: any = {};
  if (posId) where.posId = posId;
  if (dsmId) where.dsmId = dsmId;
  if (startDate) where.createdAt = { gte: startDate };
  if (endDate) where.createdAt = { lte: endDate };

  const [posTopUps, total] = await Promise.all([
    db.posTopUp.findMany({
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
        pos: true,
        member: {
          include: {
            user: true,
          },
        },
      },
    }),
    db.posTopUp.count({ where }),
  ]);

  return {
    data: posTopUps,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
