"use client";

import { TablePage } from "@/components/table-page";
import { useValidators } from "@/components/ui/auto-form/utils/validators";
import { createPosInternalTopUpAction } from "@/lib/actions/posInternalTopUp/create";
import { listPosAction } from "@/lib/actions/pos/list";
import { getInternalPosTopUpsAction } from "@/lib/actions/posInternalTopUp/list";

export default function OrganizationTransactionPosInternalPage() {
  const v = useValidators();

  return (
    <TablePage
      title="Transactions POS internes"
      description="Gérez les transactions POS internes de votre organisation"
      columns={[
        {
          header: "Date de transaction",
          accessorKey: "createdAt",
          cell: (row) => new Date(row.createdAt).toLocaleDateString(),
        },
        {
          header: "POS",
          cell: (row) => row.pos?.blueNumber,
        },
        {
          header: "Numéro rechargé",
          accessorKey: "blueNumber",
        },
        {
          header: "Montant",
          accessorKey: "amount",
        },
        {
          header: "Responsable",
          cell: (row) => row?.member?.user?.name,
        },
        {
          header: "Observations",
          accessorKey: "observations",
        },
      ]}
      dataService={getInternalPosTopUpsAction}
      createAction={createPosInternalTopUpAction}
      formFields={{
        amount: {
          label: "Montant",
          validator: v.number,
        },
        blueNumber: {
          label: "Numéro bleu",
          validator: v.string,
        },
        customerName: {
          label: "Nom du client",
          validator: v.string,
        },
        posId: {
          label: "POS",
          type: "combobox",
          validator: v.string,
          props: {
            action: async (keyword: string) => {
              const res = await listPosAction({ search: keyword });
              console.log(res);
              return res.data?.data ?? [];
            },
            getOptionLabel: (option) => option.blueNumber,
            getOptionValue: (option) => option.id,
          },
        },
        observations: {
          label: "Observations",
          type: "textarea",
          validator: v.string_nr,
        },
      }}
      canCreate={true}
      canEdit={true}
      canDelete={true}
    />
  );
}
