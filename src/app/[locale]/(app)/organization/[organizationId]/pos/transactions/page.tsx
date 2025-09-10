"use client";

import { TablePage } from "@/components/table-page";
import { useValidators } from "@/components/ui/auto-form/utils/validators";
import { createPosTopUpAction } from "@/lib/actions/posTopUp/create";
import { getPosTopUpsAction } from "@/lib/actions/posTopUp/list";
import { getDsmsAction } from "@/lib/actions/dsm/list";
import { listPosAction } from "@/lib/actions/pos/list";
import { useTranslations } from "next-intl";

export default function OrganizationTransactionDsmToPosPage() {
  const v = useValidators();
  const t = useTranslations("common");

  return (
    <TablePage
      title="Transactions Master vers DSM"
      description="Gérez les transactions Master vers DSM de votre organisation"
      dataService={getPosTopUpsAction}
      createAction={createPosTopUpAction}
      // updateAction={updatePosTopUpAction}
      // deleteAction={deleteMemberAction}
      columns={[
        {
          header: "Date",
          accessorKey: "createdAt",
          cell: (row) => new Date(row.createdAt).toLocaleDateString(),
        },
        {
          header: "Montant de départ",
          accessorKey: "previousAmount",
        },
        {
          header: "Statut",
          cell: (row) => t(`dsm.${row?.pos?.type}`),
        },
        {
          header: "Numéro blue DSM",
          cell: (row) => row?.pos?.blueNumber,
        },
        {
          header: "Montant commande DSM",
          accessorKey: "amount",
        },
        {
          header: "Commission",
          cell: (row) => `${row?.rate * row?.amount} (${row?.rate * 100}%)`,
        },
        {
          header:
            "Montant total transféré\n(Montant commande\nDSM + Commission)",
          cell: (row) => row?.amount + row?.rate * row?.amount,
        },
        {
          header: "Montant réel encaissé",
          accessorKey: "amount",
        },
        {
          header: "Responsable",
          cell: (row) => row?.member?.user?.name,
        },
      ]}
      filters={{
        posId: {
          label: "",
          type: "combobox",
          validator: v.string,
          placeholder: "DSM",
          props: {
            action: async (keyword: string) => {
              const res = await listPosAction({ search: keyword });
              console.log(res);
              return [
                { id: "", blueNumber: "Tous" },
                ...(res.data?.data ?? []),
              ];
            },
            getOptionLabel: (option) =>
              option.id === ""
                ? "Tous les clients"
                : `${option.holderName} (${option.blueNumber})`,
            getOptionValue: (option) => option.id,
          },
        },
        startDate: {
          label: "",
          type: "date",
          validator: v.string,
        },
        endDate: {
          label: "",
          type: "date",
          validator: v.string,
        },
      }}
      formFields={{
        amount: {
          label: "Montant",
          validator: v.number,
        },
        dsmId: {
          label: "Master",
          type: "combobox",
          validator: v.string,
          props: {
            action: async (keyword: string) => {
              const res = await getDsmsAction({ search: keyword });
              console.log(res);
              return res.data?.data ?? [];
            },
            getOptionLabel: (option) => `${option.name} (${option.number})`,
            getOptionValue: (option) => option.id,
          },
        },
        // blueNumber: {
        //   label: "Numéro bleu",
        //   validator: v.string,
        // },
        posId: {
          label: "DSM",
          type: "combobox",
          validator: v.string,
          props: {
            action: async (keyword: string) => {
              const res = await listPosAction({ search: keyword });
              console.log(res);
              return res.data?.data ?? [];
            },
            getOptionLabel: (option) =>
              `${option.holderName} (${option.blueNumber})`,
            getOptionValue: (option) => option.id,
          },
        },
        observations: {
          label: "Observations",
          type: "textarea",
          validator: v.string_nr,
        },
      }}
    />
  );
}
