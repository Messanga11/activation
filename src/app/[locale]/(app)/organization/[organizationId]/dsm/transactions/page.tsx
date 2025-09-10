"use client";

import { TablePage } from "@/components/table-page";
import { useValidators } from "@/components/ui/auto-form/utils/validators";
import { getDsmTopUpsAction } from "@/lib/actions/dsmTopUp/list";
import { createDsmTopUpAction } from "@/lib/actions/dsmTopUp/create";
import { getDsmsAction } from "@/lib/actions/dsm/list";

export default function OrganizationDsmTransactionsPage() {
  const v = useValidators();

  return (
    <TablePage
      title="Approvisionnement Masters"
      description="Gérez les approvisionnements Masters de votre organisation"
      columns={[
        {
          header: "Numéro",
          cell: (row) => row?.dsm?.number,
        },
        {
          header: "Montant",
          cell: (row) => row?.amount,
        },
        {
          header: "Montant précédent",
          cell: (row) => row?.previousAmount,
        },
        {
          header: "Date de transaction",
          cell: (row) => new Date(row.createdAt).toLocaleDateString(),
        },
      ]}
      dataService={getDsmTopUpsAction}
      createAction={createDsmTopUpAction}
      // updateAction={updateDsmTopUpAction}
      // deleteAction={deleteMemberAction}
      formFields={{
        dsmId: {
          label: "DSM",
          type: "combobox",
          validator: v.string,
          props: {
            action: async (keyword: string) => {
              const res = await getDsmsAction({ search: keyword });
              console.log(res);
              return res.data?.data ?? [];
            },
            getOptionLabel: (option) => option.number,
            getOptionValue: (option) => option.id,
          },
        },
        amount: {
          label: "Montant",
          type: "number",
          validator: v.number,
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
