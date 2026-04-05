"use client";

import { ExpenseReportFiltersButton } from "@/components/expenses/expense-report-filters-button";
import { SearchForm } from "@/components/search-form";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { PanelLeftIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();

  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const format = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <PanelLeftIcon />
        </Button>
        <Separator
          orientation="vertical"
          className="mr-2 data-vertical:h-4 data-vertical:self-auto"
        />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            {segments.map((segment, index) => {
              const href = "/" + segments.slice(0, index + 1).join("/");

              const isLast = index === segments.length - 1;

              return (
                <React.Fragment key={href}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{format(segment)}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={href}>{format(segment)}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>

                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex w-full items-center justify-end gap-2 sm:w-auto">
          <ExpenseReportFiltersButton />
          <SearchForm className="w-full sm:w-auto" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
