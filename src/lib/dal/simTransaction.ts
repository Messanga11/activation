import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";

export const createSimTransaction = async (data: {
  range: string;
  quantity: number;
  memberId: string;
}) => {
  return await db.$transaction(async (tx) => {
    const member = await tx.member.findUnique({
      where: { id: data.memberId },
      include: { organization: true },
    });
    if (!member) throw new NotFoundError("Member");

    // Check if organization has enough SIMs
    // if (
    //   member.organization.simCount !== null &&
    //   member.organization.simCount < data.quantity
    // ) {
    //   throw new InsufficientStockError("SIM");
    // }

    // Update organization SIM count
    if (member.organization.simCount !== null) {
      await tx.organization.update({
        where: { id: member.organization.id },
        data: { simCount: member.organization.simCount + data.quantity },
      });
    }

    // Update member SIM count
    // if (member.simCount !== null) {
    //   await tx.member.update({
    //     where: { id: member.id },
    //     data: { simCount: member.simCount + data.quantity },
    //   });
    // }

    return await tx.simTransaction.create({
      data,
      include: {
        member: {
          include: {
            user: true,
            organization: true,
          },
        },
      },
    });
  });
};

export const getSimTransaction = async (id: string) => {
  const simTransaction = await db.simTransaction.findUnique({
    where: { id },
    include: {
      member: {
        include: {
          user: true,
          organization: true,
        },
      },
    },
  });
  if (!simTransaction) throw new NotFoundError("SIM Transaction");

  return simTransaction;
};

export const getSimTransactions = async (
  memberId?: string,
  page: number = 1,
  limit: number = 20
) => {
  const skip = (page - 1) * limit;

  const where = memberId ? { memberId } : {};

  const [simTransactions, total] = await Promise.all([
    db.simTransaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        member: {
          include: {
            user: true,
            organization: true,
          },
        },
      },
    }),
    db.simTransaction.count({ where }),
  ]);

  return {
    data: simTransactions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
