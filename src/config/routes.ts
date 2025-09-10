export const ROUTES = {
  dashboard: "/dashboard",
  login: "/login",
  users: "/users",
  organizations: "/organizations",
  organization: (organizationId: string) => `/organization/${organizationId}`,
  organizationTeam: (organizationId: string) =>
    `/organization/${organizationId}/team`,
  organizationSimSales: (organizationId: string) =>
    `/organization/${organizationId}/sim-sales`,
  organizationDsm: (organizationId: string) =>
    `/organization/${organizationId}/dsm`,
  organizationDsmTransactions: (organizationId: string) =>
    `/organization/${organizationId}/dsm/transactions`,
  organizationPos: (organizationId: string) =>
    `/organization/${organizationId}/pos`,
  organizationTransactionDsmToPos: (organizationId: string) =>
    `/organization/${organizationId}/pos/transactions`,
  organizationTransactionSim: (organizationId: string) =>
    `/organization/${organizationId}/transaction-sim`,
  organizationTransactionSimTeamLeader: (organizationId: string) =>
    `/organization/${organizationId}/transaction-sim-team-leader`,
  organizationTransactionSimBa: (organizationId: string) =>
    `/organization/${organizationId}/transaction-sim-ba`,
};
