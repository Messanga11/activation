/** biome-ignore-all lint/suspicious/noExplicitAny: needed */
import { db } from "@/lib/db";
import type { SimSale, Member, User, Pos, PosTopUp } from "@/generated/prisma";
import ExcelJS from "exceljs";

const columns = {
  simSale: {
    Client: (row: SimSale) => row.customerName,
    "Date de vente": (row: SimSale) => row.createdAt,
    "Numéro blue": (row: SimSale) => row.blueNumber,
    "Autre numéro": (row: SimSale) => row.otherNumber,
    "CNI du client": (row: SimSale) => row.cni,
    Adresse: (row: SimSale) => row.address,
    IMEI: (row: SimSale) => row.imei,
    ICCID: (row: SimSale) => row.iccid,
    BA: (row: SimSale & { ba: Member & { user: User } }) => row.ba?.user?.name,
    "Team leader": (row: SimSale & { teamLeader: Member & { user: User } }) =>
      row.teamLeader?.user?.name,
  },
  posTopUp: {
    Date: (row: PosTopUp) => row.createdAt,
    "Montant de départ": (row: PosTopUp) => row.previousAmount,
    Statut: (row: PosTopUp & { pos: Pos }) => row.pos.type,
    "Numéro blue": (row: PosTopUp & { pos: Pos }) => row.pos.blueNumber,
    "Montant commande DSM": (row: PosTopUp) => row.amount,
    Commission: (row: PosTopUp) => row.rate,
    "Montant total": (row: PosTopUp) => row.amount + row.rate,
    "Montant réel encaissé": (row: PosTopUp) => row.amount,
    Responsable: (row: PosTopUp & { member: Member & { user: User } }) =>
      row.member?.user?.name,
  },
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");
  const model = searchParams.get("model");

  if (!model) {
    return new Response(JSON.stringify({ error: "Missing model" }), {
      status: 400,
    });
  }

  if (!["simSale", "posTopUp"].includes(model)) {
    return new Response(JSON.stringify({ error: "Invalid model" }), {
      status: 400,
    });
  }

  if (!startDate || !endDate) {
    return new Response(
      JSON.stringify({ error: "Missing start or end date" }),
      { status: 400 }
    );
  }

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  let data: any[] = [];
  if (model === "simSale") {
    data = await db.simSale.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
      include: {
        ba: { include: { user: true } },
        teamLeader: { include: { user: true } },
      },
    });
  } else if (model === "posTopUp") {
    data = await db.posTopUp.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
      include: {
        pos: true,
        member: { include: { user: true } },
      },
    });
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Export");

  const cols = columns[model as keyof typeof columns];
  sheet.columns = Object.entries(cols).map(([key]) => ({
    header: key,
    key,
    width: 20,
  }));

  if (data.length === 0) {
    sheet.addRow({});
  } else {
    data.forEach((item) => {
      const row: Record<string, any> = {};
      for (const [key, col] of Object.entries(cols)) {
        row[key] = col(item);
      }
      sheet.addRow(row);
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${model}_${startDate}_to_${endDate}.xlsx"`,
    },
  });
}
