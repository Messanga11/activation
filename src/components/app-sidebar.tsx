"use client";

import * as React from "react";
import {
  IconCamera,
  IconCpu,
  IconDashboard,
  IconFileAi,
  IconFileDescription,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ROUTES } from "@/config/routes";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ModeToggle } from "./theme-toggle";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: (organizationId?: string) => [
    {
      title: "Dashboard",
      path: ROUTES.organization("[organizationId]"),
      url: ROUTES.organization(organizationId ?? ""),
      icon: IconDashboard,
    },
    {
      title: "Team",
      path: ROUTES.organizationTeam("[organizationId]"),
      url: ROUTES.organizationTeam(organizationId ?? ""),
      icon: IconUsers,
    },
    {
      title: "Vente SIM",
      path: ROUTES.organizationSimSales("[organizationId]"),
      url: ROUTES.organizationSimSales(organizationId ?? ""),
      icon: IconCpu,
    },
    {
      title: "Masters",
      path: ROUTES.organizationDsm("[organizationId]"),
      url: ROUTES.organizationDsm(organizationId ?? ""),
      icon: IconCpu,
    },
    {
      title: "Approvisionnement Masters",
      path: ROUTES.organizationDsmTransactions("[organizationId]"),
      url: ROUTES.organizationDsmTransactions(organizationId ?? ""),
      icon: IconCpu,
    },
    {
      title: "DSM",
      path: ROUTES.organizationPos("[organizationId]"),
      url: ROUTES.organizationPos(organizationId ?? ""),
      icon: IconCpu,
    },
    {
      title: "Transaction Masters vers DSM",
      path: ROUTES.organizationTransactionDsmToPos("[organizationId]"),
      url: ROUTES.organizationTransactionDsmToPos(organizationId ?? ""),
      icon: IconCpu,
    },
    {
      title: `Stock SIM RA`,
      path: ROUTES.organizationTransactionSim("[organizationId]"),
      url: ROUTES.organizationTransactionSim(organizationId ?? ""),
      icon: IconCpu,
    },
    {
      title: "Stock SIM RA vers Team Leader",
      path: ROUTES.organizationTransactionSimTeamLeader("[organizationId]"),
      url: ROUTES.organizationTransactionSimTeamLeader(organizationId ?? ""),
      icon: IconCpu,
    },
    {
      title: "Stock SIM Team Leader vers BA",
      path: ROUTES.organizationTransactionSimBa("[organizationId]"),
      url: ROUTES.organizationTransactionSimBa(organizationId ?? ""),
      icon: IconCpu,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      title: "Dashboard",
      url: ROUTES.dashboard,
      icon: IconDashboard,
    },
    {
      title: "Organizations",
      url: ROUTES.organizations,
      icon: IconListDetails,
    },
    {
      title: "Utilisateurs",
      url: ROUTES.users,
      icon: IconUsers,
    },
  ],
};

export function AppSidebar({
  session,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  organization?: boolean;
  session: {
    data: {
      user: {
        name: string;
        email: string;
        avatar: string;
        role: string;
        organization: { name: string };
      };
    };
  };
}) {
  const { organizationId } = useParams();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">
                  {session.data?.user?.organization?.name || "Acme Inc."}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={data.navMain(organizationId as string)}
          session={session}
        />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} />
      </SidebarContent>
      <SidebarFooter>
        <ModeToggle />
        <NavUser
          user={session.data?.user || { name: "", email: "", avatar: "" }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
