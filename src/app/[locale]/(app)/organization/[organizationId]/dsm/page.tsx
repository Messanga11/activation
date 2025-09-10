"use client";

import { TablePage } from "@/components/table-page";
import { useValidators } from "@/components/ui/auto-form/utils/validators";
import { getDsmsAction } from "@/lib/actions/dsm/list";
import { createDsmAction } from "@/lib/actions/dsm/create";
import { updateDsmAction } from "@/lib/actions/dsm/update";

export default function OrganizationDsmPage() {
  const v = useValidators();

  return (
    <TablePage
      title="Masters"
      description="Gérez les Masters de votre organisation"
      columns={[
        {
          header: "Nom",
          accessorKey: "name",
        },
        {
          header: "Numéro",
          accessorKey: "number",
        },
        {
          header: "Total Appro.",
          accessorKey: "totalPrevious",
        },
        {
          header: "Montant restant",
          accessorKey: "amount",
        },
        {
          header: "Date de création",
          accessorKey: "createdAt",
          cell: (row) => new Date(row.createdAt).toLocaleDateString(),
        },
      ]}
      dataService={getDsmsAction}
      createAction={createDsmAction}
      updateAction={updateDsmAction}
      // deleteAction={deleteMemberAction}
      formFields={{
        name: {
          label: "Nom",
          validator: v.string,
          initialValue(item) {
            return item.name;
          },
        },
        number: {
          label: "Numéro",
          type: "phone",
          validator: v.string,
          initialValue(item) {
            return item.number;
          },
        },
        amount: {
          label: "Montant",
          type: "number",
          hide: (item) => !!item?.id,
          validator: v.number,
          initialValue(item) {
            return item.amount;
          },
        },
      }}
    />
  );
}
