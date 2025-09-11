import { PosType } from "@/generated/prisma";
import {
  AuthorizationError,
  InsufficientStockError,
  NotFoundError,
} from "../errors";
import { db } from "../db";
import { getSession, requireSupervisor } from "../auth/role";

export const createPosInternalTopUp = async (data: {
  amount: number;
  memberId: string;
  blueNumber: string;
  posId: string;
  observations?: string;
  customerName?: string;
}) => {
  const session = await getSession();
  const organizationId = session?.user.organizationId;

  if (!organizationId) throw new AuthorizationError();

  return await db.$transaction(
    async (tx) => {
      // Check if POS and member exist
      const [pos, member] = await Promise.all([
        tx.pos.findUnique({ where: { id: data.posId } }),
        tx.member.findUnique({ where: { id: session?.user.memberId } }),
      ]);

      if (!pos) throw new NotFoundError("POS");
      if (!member) throw new NotFoundError("Member");

      if (pos.organizationId !== organizationId) throw new AuthorizationError();

      if (pos.type !== PosType.OFFICE) {
        throw new Error("POS type must be internal");
      }

      // Check if POS has enough amount
      if (pos.amount < data.amount) {
        throw new InsufficientStockError("POS");
      }

      // Update POS amount
      await tx.pos.update({
        where: { id: pos.id },
        data: { amount: pos.amount - data.amount },
      });

      // Create the top-up
      // @ts-expect-error
      return await tx.posInternalTopUp.create({
        data: {
          ...data,
          previousAmount: pos.amount,
        },
        include: {
          pos: true,
          member: {
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

export const getInternalPosTopUps = async (
  posId?: string,
  page: number = 1,
  limit: number = 20,
  search?: string
) => {
  const session = await getSession();
  const organizationId = session?.user.organizationId;

  await requireSupervisor(organizationId);

  const skip = (page - 1) * limit;

  // biome-ignore lint/suspicious/noExplicitAny: any required
  const where: any = {};

  if (posId) {
    const pos = await db.pos.findUnique({ where: { id: posId } });

    if (!pos) throw new NotFoundError("POS");

    if (pos.organizationId !== organizationId) throw new AuthorizationError();

    if (pos.type !== PosType.OFFICE) {
      throw new Error("POS type must be internal");
    }

    where.posId = posId;
  }

  if (search) {
    where.OR = [{ blueNumber: { contains: search, mode: "insensitive" } }];
  }

  const [posInternalTopUps, total] = await Promise.all([
    // @ts-expect-error
    db.posInternalTopUp.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        pos: true,
        member: {
          include: {
            user: true,
          },
        },
      },
    }),
    // @ts-expect-error
    db.posInternalTopUp.count({ where }),
  ]);

  return {
    data: posInternalTopUps,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
