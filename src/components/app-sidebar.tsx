"use client";

import * as React from "react";
import Link from "next/link";
import { canManageDomains, isAdminRole, type DashboardRole } from "@/lib/authz";

import { NavMain } from "@/components/nav-main";
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
import {
  BookOpenIcon,
  FilePlus2Icon,
  PieChartIcon,
  ReceiptIcon,
  ClipboardCheckIcon,
} from "lucide-react";

type SidebarUser = {
  name: string;
  email: string;
  avatar: string;
  role: DashboardRole;
};

type NavItem = {
  title: string;
  url: string;
  icon: React.ReactNode;
  items?: { title: string; url: string }[];
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: SidebarUser;
}) {
  const navMain: NavItem[] = [];

  if (isAdminRole(user.role)) {
    navMain.push({
      title: "Finance",
      url: "/finance/report",
      icon: <PieChartIcon />,
      items: [
        { title: "Finance Report", url: "/finance/report" },
        { title: "Finance Actions", url: "/finance/action" },
      ],
    });
  }

  if (canManageDomains(user.role)) {
    navMain.push({
      title: "All Domains",
      url: "/domains",
      icon: <BookOpenIcon />,
    });
    navMain.push({
      title: "Create Domain",
      url: "/domains/new",
      icon: <FilePlus2Icon />,
    });
    navMain.push({
      title: "Submissions",
      url: "/submissions",
      icon: <ClipboardCheckIcon />,
    });
  }

  if (isAdminRole(user.role)) {
    navMain.push({
      title: "Invoices",
      url: "/invoices",
      icon: <ReceiptIcon />,
    });
  }

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden">
                  <img
                    src="/devitbig.png"
                    alt="DevIt Logo"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">DevIt</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}