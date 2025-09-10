"use client";

import { TablePage } from "@/components/table-page";
import { useValidators } from "@/components/ui/auto-form/utils/validators";
import { createSimTransactionAction } from "@/lib/actions/simTransaction/create";
import { getSimTransactionsAction } from "@/lib/actions/simTransaction/list";

export default function OrganizationTransactionSimPage() {
  const v = useValidators();

  return (
    <TablePage
      title="Approvisionnement SIM"
      description="Gérez les approvisionnements SIM de votre organisation"
      columns={[
        {
          header: "Date",
          accessorKey: "createdAt",
          cell: (row) => new Date(row.createdAt).toLocaleDateString(),
        },
        {
          header: "Quantité",
          accessorKey: "quantity",
        },
        {
          header: "Plage",
          accessorKey: "range",
        },
        {
          header: "Responsable",
          cell: (row) => row?.member?.user?.name,
        },
      ]}
      dataService={getSimTransactionsAction}
      createAction={createSimTransactionAction}
      formFields={{
        quantity: {
          label: "Quantité",
          validator: v.number,
        },
        range: {
          label: "Plage",
          validator: v.string,
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
