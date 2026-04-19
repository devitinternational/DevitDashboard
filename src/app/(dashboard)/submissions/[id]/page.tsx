import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { canManageDomains } from "@/lib/authz";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  User,
  BookOpen,
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";

// ─── Server action ────────────────────────────────────────────────────────────
async function reviewSubmission(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user || !canManageDomains(session.user.role)) {
    throw new Error("Unauthorized");
  }

  const submissionId = formData.get("submissionId") as string;
  const status = formData.get("status") as
    | "PASSED"
    | "FAILED"
    | "NEEDS_REVISION";
  const reviewNotes = (formData.get("reviewNotes") as string)?.trim() || null;

  if (!submissionId || !status) throw new Error("Missing fields");

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status,
      reviewNotes,
      reviewedAt: new Date(),
    },
  });

  // tryCompleteCourse is handled by the backend webhook — but since we're
  // updating via Prisma directly here, fire the backend review endpoint
  // so the certificate flow triggers correctly.
  const backendUrl = process.env.BACKEND_URL;
  const secret = process.env.AUTH_SECRET; // reuse shared secret for internal call

  if (backendUrl && secret) {
    try {
      await fetch(`${backendUrl}/api/submissions/${submissionId}/review`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          // Use a service-level header your backend trusts, or just
          // update via Prisma above and skip this if backend isn't needed.
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({ status, reviewNotes }),
      });
    } catch {
      // Non-fatal — Prisma update already happened above
    }
  }

  revalidatePath("/submissions");
  redirect("/submissions");
}

// ─── Data fetch ───────────────────────────────────────────────────────────────
async function getSubmission(id: string) {
  return prisma.submission.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      repoUrl: true,
      notes: true,
      reviewNotes: true,
      reviewedAt: true,
      createdAt: true,
      quizScore: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
        },
      },
      task: {
        select: {
          id: true,
          title: true,
          description: true,
          taskType: true,
          passingScore: true,
          isRequired: true,
        },
      },
      enrollment: {
        select: {
          id: true,
          durationMonths: true,
          startDate: true,
          domain: { select: { id: true, title: true, slug: true } },
        },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sub = await getSubmission(id);
  return {
    title: sub
      ? `Review: ${sub.user.name ?? sub.user.email} — ${sub.task.title}`
      : "Submission | Admin",
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function SubmissionReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!canManageDomains(session.user.role)) redirect("/");

  const { id } = await params;
  const sub = await getSubmission(id);
  if (!sub) notFound();

  const isAlreadyReviewed =
    sub.status === "PASSED" || sub.status === "FAILED";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/submissions">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> All submissions
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Review Submission
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {sub.task.title} · {sub.enrollment.domain.title}
          </p>
        </div>
        <StatusBadge status={sub.status} />
      </div>

      {/* Info cards row */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Learner */}
        <div className="border border-border rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
            <User className="h-3.5 w-3.5" /> Learner
          </div>
          <p className="text-sm font-medium">{sub.user.name ?? "—"}</p>
          <p className="text-xs text-muted-foreground truncate">
            {sub.user.email}
          </p>
          <p className="text-xs text-muted-foreground">
            Joined{" "}
            {new Date(sub.user.createdAt).toLocaleDateString("en-IN", {
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Track */}
        <div className="border border-border rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
            <BookOpen className="h-3.5 w-3.5" /> Track
          </div>
          <p className="text-sm font-medium">{sub.enrollment.domain.title}</p>
          <p className="text-xs text-muted-foreground">
            {sub.enrollment.durationMonths} month
            {sub.enrollment.durationMonths > 1 ? "s" : ""}
          </p>
          <p className="text-xs text-muted-foreground">
            Started{" "}
            {new Date(sub.enrollment.startDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Submission */}
        <div className="border border-border rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
            <Github className="h-3.5 w-3.5" /> Submission
          </div>
          <p className="text-xs text-muted-foreground">
            Submitted{" "}
            {new Date(sub.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
          {sub.task.isRequired && (
            <Badge variant="outline" className="text-xs h-5 px-1.5 mt-1">
              Required for certificate
            </Badge>
          )}
        </div>
      </div>

      {/* Task description */}
      {sub.task.description && (
        <div className="border border-border rounded-xl p-5 space-y-2">
          <h2 className="text-sm font-semibold">Task Brief</h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {sub.task.description}
          </p>
        </div>
      )}

      {/* Repo link */}
      {sub.repoUrl && (
        <div className="border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-3">Repository</h2>
          <a
            href={sub.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium hover:underline underline-offset-4"
          >
            <Github className="h-4 w-4" />
            {sub.repoUrl}
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </a>
          {sub.notes && (
            <p className="mt-3 text-sm text-muted-foreground border-t border-border pt-3">
              <span className="font-medium text-foreground">Learner note: </span>
              {sub.notes}
            </p>
          )}
        </div>
      )}

      {/* Previous review notes (if any) */}
      {sub.reviewNotes && (
        <div className="border border-orange-200 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-orange-900 dark:text-orange-300 mb-1">
            Previous Review Notes
          </h2>
          <p className="text-sm text-orange-800 dark:text-orange-400">
            {sub.reviewNotes}
          </p>
          {sub.reviewedAt && (
            <p className="text-xs text-orange-600 dark:text-orange-500 mt-2">
              Reviewed{" "}
              {new Date(sub.reviewedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      )}

      {/* Review form */}
      <div className="border border-border rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold">
          {isAlreadyReviewed ? "Update Review" : "Submit Review"}
        </h2>

        <form action={reviewSubmission} className="space-y-4">
          <input type="hidden" name="submissionId" value={sub.id} />

          {/* Review notes */}
          <div className="space-y-1.5">
            <label
              htmlFor="reviewNotes"
              className="text-xs font-medium text-muted-foreground"
            >
              Review Notes{" "}
              <span className="text-muted-foreground/60">(optional)</span>
            </label>
            <Textarea
              id="reviewNotes"
              name="reviewNotes"
              rows={4}
              placeholder="Explain what was done well, what needs improvement, or why it's being marked as revised..."
              defaultValue={sub.reviewNotes ?? ""}
              className="resize-none text-sm"
            />
          </div>

          {/* Action buttons — each submits with its status value */}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              name="status"
              value="PASSED"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
            >
              <CheckCircle className="h-4 w-4" /> Mark as Passed
            </button>
            <button
              type="submit"
              name="status"
              value="NEEDS_REVISION"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white transition-colors"
            >
              <RotateCcw className="h-4 w-4" /> Request Revision
            </button>
            <button
              type="submit"
              name="status"
              value="FAILED"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-border hover:bg-muted transition-colors text-destructive"
            >
              <XCircle className="h-4 w-4" /> Mark as Failed
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "text-yellow-700 border-yellow-300 bg-yellow-50",
    NEEDS_REVISION: "text-orange-700 border-orange-300 bg-orange-50",
    PASSED: "text-green-700 border-green-300 bg-green-50",
    FAILED: "text-red-700 border-red-300 bg-red-50",
  };
  const label: Record<string, string> = {
    PENDING: "Pending Review",
    NEEDS_REVISION: "Needs Revision",
    PASSED: "Passed",
    FAILED: "Failed",
  };
  return (
    <Badge variant="outline" className={`text-sm h-7 px-3 ${map[status] ?? ""}`}>
      {label[status] ?? status}
    </Badge>
  );
}