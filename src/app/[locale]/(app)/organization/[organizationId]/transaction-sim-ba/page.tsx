"use client";

import { TablePage } from "@/components/table-page";
import { useValidators } from "@/components/ui/auto-form/utils/validators";
import { UserRole } from "@/generated/prisma";
import { listMembersAction } from "@/lib/actions/member/list";
import { createSimTransactionBaTeamLeaderAction } from "@/lib/actions/simTransactionBaTeamLeader/create";
import { getSimTransactionBaTeamLeaderAction } from "@/lib/actions/simTransactionBaTeamLeader/list";
import { authClient } from "@/lib/auth-client";

export default function OrganizationTransactionSimBaPage() {
  const v = useValidators();
  const session = authClient.useSession();

  return (
    <TablePage
      title="Stock SIM Team Leader vers BA"
      description="Gérez les transactions SIM Team Leader vers BA de votre organisation"
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
        {
          header: "BA",
          cell: (row) => row.ba?.user?.name,
        },
      ]}
      dataService={getSimTransactionBaTeamLeaderAction}
      createAction={createSimTransactionBaTeamLeaderAction}
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
        baId: {
          label: "BA",
          validator: v.string,
          type: "combobox",
          props: {
            action: async (keyword: string) => {
              const res = await listMembersAction({
                role: UserRole.BA,
                search: keyword,
              });
              console.log(res);
              return res.data?.data ?? [];
            },
            getOptionLabel: (option) => option.user?.name,
            getOptionValue: (option) => option.id,
          },
        },
        teamLeaderId: {
          label: "Team Leader",
          validator: v.string,
          hide() {
            return session.data?.user.role === UserRole.TEAM_LEADER;
          },
          type: "combobox",
          props: {
            action: async (keyword: string) => {
              const res = await listMembersAction({
                role: UserRole.TEAM_LEADER,
                search: keyword,
              });
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
