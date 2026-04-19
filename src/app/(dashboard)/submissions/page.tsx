import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { canManageDomains } from "@/lib/authz";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

async function getPendingSubmissions() {
  const session = await auth();
  if (!session?.user?.id || !canManageDomains(session.user.role)) return [];

  return prisma.submission.findMany({
    where: {
      taskType_filter: undefined,
      task: { taskType: "PROJECT" },
      status: { in: ["PENDING", "NEEDS_REVISION"] },
    },
    orderBy: { createdAt: "asc" }, // oldest first — review FIFO
    select: {
      id: true,
      status: true,
      repoUrl: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { name: true, email: true, image: true } },
      task: { select: { id: true, title: true } },
      enrollment: {
        select: {
          id: true,
          domain: { select: { title: true } },
        },
      },
    },
  });
}

const statusConfig = {
  PENDING: {
    label: "Pending Review",
    icon: Clock,
    className: "text-yellow-700 border-yellow-300 bg-yellow-50",
  },
  NEEDS_REVISION: {
    label: "Needs Revision",
    icon: AlertCircle,
    className: "text-orange-700 border-orange-300 bg-orange-50",
  },
  PASSED: {
    label: "Passed",
    icon: CheckCircle,
    className: "text-green-700 border-green-300 bg-green-50",
  },
  FAILED: {
    label: "Failed",
    icon: XCircle,
    className: "text-red-700 border-red-300 bg-red-50",
  },
} as const;

export const metadata = { title: "Submissions | Admin Dashboard" };

export default async function SubmissionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canManageDomains(session.user.role)) redirect("/");

  const submissions = await getPendingSubmissions();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Project Submissions
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Pending learner project submissions awaiting review
          </p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1">
          {submissions.length} pending
        </Badge>
      </div>

      {submissions.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl py-16 flex flex-col items-center gap-3 text-center">
          <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">All caught up!</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              No pending submissions to review right now.
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-border rounded-xl divide-y divide-border overflow-hidden">
          {submissions.map((sub) => {
            const cfg = statusConfig[sub.status as keyof typeof statusConfig];
            const Icon = cfg.icon;
            return (
              <div
                key={sub.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors"
              >
                {/* Avatar */}
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-semibold text-muted-foreground overflow-hidden">
                  {sub.user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sub.user.image}
                      alt={sub.user.name ?? ""}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (sub.user.name ?? sub.user.email ?? "?")
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium truncate">
                      {sub.user.name ?? sub.user.email}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-xs h-5 px-1.5 ${cfg.className}`}
                    >
                      <Icon className="h-2.5 w-2.5 mr-1" />
                      {cfg.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {sub.enrollment.domain.title} · {sub.task.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Submitted{" "}
                    {new Date(sub.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Repo link */}
                {sub.repoUrl && (
                  <a
                    href={sub.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 shrink-0 font-medium"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Repo
                  </a>
                )}

                {/* Review button */}
                <Button size="sm" asChild className="shrink-0">
                  <Link href={`/submissions/${sub.id}`}>Review</Link>
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}