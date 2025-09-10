"use client";

import { TablePage } from "@/components/table-page";
import { useValidators } from "@/components/ui/auto-form/utils/validators";
import { UserRole } from "@/generated/prisma";
import { listMembersAction } from "@/lib/actions/member/list";
import { createSimOrganizationTransactionAction } from "@/lib/actions/simOrganizationTransaction/create";
import { getSimOrganizationTransactionsAction } from "@/lib/actions/simOrganizationTransaction/list";

export default function OrganizationTransactionSimTeamLeaderPage() {
  const v = useValidators();

  return (
    <TablePage
      title="Transactions RA vers Team Leader SIM"
      description="Gérez les transactions RA vers Team Leader SIM de votre organisation"
      dataService={getSimOrganizationTransactionsAction}
      createAction={createSimOrganizationTransactionAction}
      columns={[
        {
          header: "Date de transaction",
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
        {
          header: "Team Leader",
          cell: (row) => row.teamLeader?.user?.name,
        },
      ]}
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
        teamLeaderId: {
          label: "Team Leader",
          validator: v.string,
          type: "combobox",
          props: {
            action: async (keyword: string) => {
              const res = await listMembersAction({
                role: UserRole.TEAM_LEADER,
                search: keyword,
              });
              console.log(res);
              return res.data?.data ?? [];
            },
            getOptionLabel: (option) => option.user?.name,
            getOptionValue: (option) => option.id,
          },
        },
      }}
    />
  );
}
