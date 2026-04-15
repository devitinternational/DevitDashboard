"use client";

import * as React from "react";
import Link from "next/link";

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
import { BookOpenIcon, FilePlus2Icon, PieChartIcon } from "lucide-react";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/devitbig.png",
  },
  navMain: [
    // {
    //   title: "Expenses",
    //   url: "/expenses/report",
    //   icon: <PieChartIcon />, // you can change icon if you want
    //   items: [
    //     {
    //       title: "Expense Report",
    //       url: "/expenses/report",
    //     },
    //     {
    //       title: "Expense Actions",
    //       url: "/expenses/action",
    //     },
    //   ],
    // },
    {
      title: "Finance",
      url: "/finance/report",
      icon: <PieChartIcon />, // you can change icon if you want
      items: [
        {
          title: "Finance Report",
          url: "/finance/report",
        },
        {
          title: "Finance Actions",
          url: "/finance/action",
        },
      ],
    },
    {
      title: "All Domains",
      url: "/domains",
      icon: <BookOpenIcon />,
      // items: [
      //   {
      //     title: "All Domains",
      //     url: "/domains",
      //   },
      //   {
      //     title: "New Domain",
      //     url: "/domains/new",
      //   },
      // ],
    },
    {
      title: "Create Domain",
      url: "/domains/new",
      icon: <FilePlus2Icon />,
    },
  ],
  // navSecondary: [
  //   {
  //     title: "Support",
  //     url: "#",
  //     icon: <LifeBuoyIcon />,
  //   },
  //   {
  //     title: "Feedback",
  //     url: "#",
  //     icon: <SendIcon />,
  //   },
  // ],
};

type SidebarUser = {
  name: string;
  email: string;
  avatar: string;
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: SidebarUser;
}) {
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
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden">
                    <img
                      src="/devitbig.png"
                      alt="DevIt Logo"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
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
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
