"use client";

import { TablePage } from "@/components/table-page";
import { ListTile } from "@/components/list-tile";
import { AvatarItem } from "@/components/avatar-item";
import { createSimSaleAction } from "@/lib/actions/simSale/create";
import { useValidators } from "@/components/ui/auto-form/utils/validators";
import { listSimSalesAction } from "@/lib/actions/simSale/list";
import { listMembersAction } from "@/lib/actions/member/list";
import { UserRole } from "@/generated/prisma";
import { authClient } from "@/lib/auth-client";

export default function SimSalesPage() {
  const v = useValidators();
  const session = authClient.useSession();

  const isBA = session?.data?.user?.role === UserRole.BA;

  return (
    <TablePage
      title="Ventes de SIM"
      description="Gérez les ventes de SIM de votre organisation"
      exportModel="simSale"
      columns={[
        {
          header: "Client",
          cellClassName: "min-w-[250px]",
          cell: (row) => (
            <ListTile
              icon={<AvatarItem title={row.customerName ?? ""} />}
              title={row.customerName ?? ""}
              description={`CNI: ${row.cni ?? ""}`}
            />
          ),
        },
        {
          header: "Date de vente",
          accessorKey: "createdAt",
          cell: (row) => new Date(row.createdAt).toLocaleDateString(),
        },
        {
          header: "Numéro blue",
          cell: (row) => (
            <div className="flex flex-col">
              <span>{row.blueNumber}</span>
            </div>
          ),
        },
        {
          header: "Autre numéro",
          cell: (row) => (
            <div className="flex flex-col">
              <span>{row.otherNumber}</span>
            </div>
          ),
        },
        {
          header: "CNI du client",
          cell: (row) => (
            <div className="flex flex-col">
              <span>{row.cni}</span>
            </div>
          ),
        },
        {
          header: "Adresse",
          cell: (row) => (
            <div className="flex flex-col">
              <span>{row.address}</span>
            </div>
          ),
        },
        {
          header: "IMEI",
          cell: (row) => (
            <div className="flex flex-col">
              <span>{row.imei}</span>
            </div>
          ),
        },

        {
          header: "ICCID",
          cell: (row) => (
            <div className="flex flex-col">
              <span>{row.iccid}</span>
            </div>
          ),
        },
        {
          header: "BA",
          cell: (row) => (
            <div className="flex flex-col">
              <span>{row.ba?.user?.name || "N/A"}</span>
            </div>
          ),
        },
        {
          header: "Team leader",
          cell: (row) => (
            <div className="flex flex-col">
              <span>{row.teamLeader?.user?.name || "N/A"}</span>
            </div>
          ),
        },
      ]}
      dataService={listSimSalesAction}
      createAction={createSimSaleAction}
      formFields={{
        customerName: {
          label: "Nom du client",
          validator: v.string.min(1, "Le nom du client est requis"),
        },
        cni: {
          label: "Numéro CNI",
          validator: v.string.min(1, "Le numéro CNI est requis"),
        },
        blueNumber: {
          label: "Numéro bleu",
          type: "phone",
          validator: v.string.min(1, "Le numéro bleu est requis"),
        },
        otherNumber: {
          label: "Autre numéro",
          type: "phone",
          validator: v.string.min(1, "L'autre numéro est requis"),
        },
        address: {
          label: "Adresse",
          validator: v.string.min(1, "L'adresse est requise"),
        },
        imei: {
          label: "IMEI",
          validator: v.string.min(1, "L'IMEI est requis"),
        },
        iccid: {
          label: "ICCID",
          validator: v.string.min(1, "L'ICCID est requis"),
        },
        ...(isBA
          ? {}
          : {
              baId: {
                label: "BA",
                type: "combobox",
                validator: v.string.cuid("Sélectionnez un BA valide"),
                // Note: Vous devrez ajouter une logique pour charger les options des BA
                props: {
                  action: async (keyword) => {
                    const res = await listMembersAction({
                      role: UserRole.BA,
                      search: keyword,
                    });
                    return res.data?.data ?? [];
                  },
                  getOptionLabel: (option) => option.user.name,
                  getOptionValue: (option) => option.user.id,
                },
              },
            }),
      }}
    />
  );
}
