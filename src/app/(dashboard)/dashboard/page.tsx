import Link from "next/link";
import { auth } from "@/auth";
import { isCreatorRole } from "@/lib/authz";
import {
  ArrowRight,
  BadgeIndianRupee,
  ChartNoAxesCombined,
  FileSpreadsheet,
  PlusCircle,
  WalletCards,
} from "lucide-react";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const quickActions = [
  {
    title: "Finance workspace",
    description: "Create and manage income or expense entries from one shared surface.",
    href: "/finance/action",
    icon: PlusCircle,
    cta: "Open actions",
  },
  {
    title: "P&L reporting",
    description: "Review income, expenses, and net performance with dual-currency visibility.",
    href: "/finance/report",
    icon: ChartNoAxesCombined,
    cta: "View report",
  },
  {
    title: "Expense insights",
    description: "Track category patterns and spending rhythm across the team.",
    href: "/expenses/report",
    icon: FileSpreadsheet,
    cta: "See expenses",
  },
] as const;

const highlights = [
  "Structured capture for cleaner finance operations",
  "Shared shadcn-driven surfaces with stronger visual hierarchy",
  "Built-in INR and MYR workflows for reporting and review",
] as const;

export default async function DashboardPage() {
  const session = await auth();
  if (isCreatorRole(session?.user?.role)) {
    redirect("/domains");
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 bg-[radial-gradient(circle_at_top_left,_hsl(var(--primary)/0.16),_transparent_34%),linear-gradient(135deg,hsl(var(--card)),hsl(var(--muted)/0.45))] shadow-sm ring-1 ring-border/60">
        <CardContent className="grid gap-8 px-6 py-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.9fr)] lg:px-8 lg:py-8">
          <div className="space-y-5">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <WalletCards className="size-3.5 text-primary" />
              Finance command center
            </div>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
                A cleaner workspace for tracking spend, income, and reporting.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                Use the dashboard as a launchpad into daily finance actions, polished forms,
                and dual-currency reporting that feels ready for internal reviews.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-xl shadow-sm">
                <Link href="/finance/action">
                  Add new entry
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl bg-background/70">
                <Link href="/finance/report">Open finance report</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <Card className="border-0 bg-background/80 shadow-sm ring-1 ring-border/60 backdrop-blur">
              <CardHeader className="pb-3">
                <CardDescription>Workflow</CardDescription>
                <CardTitle className="text-lg">Capture faster</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Entry forms now feel more guided, reducing friction during daily updates.
              </CardContent>
            </Card>
            <Card className="border-0 bg-background/80 shadow-sm ring-1 ring-border/60 backdrop-blur">
              <CardHeader className="pb-3">
                <CardDescription>Reporting</CardDescription>
                <CardTitle className="text-lg">Review smarter</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
                <BadgeIndianRupee className="size-4 text-primary" />
                Switch finance report values between INR and MYR without leaving the page.
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.9fr)]">
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map(({ title, description, href, icon: Icon, cta }) => (
            <Card
              key={title}
              className="border-0 bg-card/90 shadow-sm ring-1 ring-border transition-transform hover:-translate-y-0.5"
            >
              <CardHeader className="space-y-4">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <CardDescription className="leading-6">{description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full rounded-xl">
                  <Link href={href}>
                    {cta}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-0 bg-muted/30 shadow-sm ring-1 ring-border">
          <CardHeader>
            <CardDescription>Operational notes</CardDescription>
            <CardTitle className="text-xl">What this dashboard is optimized for</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {highlights.map((item, index) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl bg-background/80 px-4 py-3 shadow-sm ring-1 ring-border/60"
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
