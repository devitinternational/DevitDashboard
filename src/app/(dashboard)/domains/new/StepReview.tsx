"use client";

import { useState } from "react";
import { useBuilderStore } from "@/store/builder-store";
import { domainApi } from "@/lib/api/domains";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  BookOpen,
  CheckCircle2,
  IndianRupee,
  Globe,
  Loader2,
  AlertCircle,
} from "lucide-react";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Failed to publish";
}

function ReviewRow({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-4 py-4">
      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function StepReview() {
  const { details, sections, tasks, savedDomainId, setStep, reset } = useBuilderStore();
  const [publishing, setPublishing] = useState(false);
  const router = useRouter();

  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0);
  const requiredTasks = tasks.filter((t) => t.isRequired).length;
  const quizCount = tasks.filter((t) => t.taskType === "QUIZ").length;
  const projectCount = tasks.filter((t) => t.taskType === "PROJECT").length;

  const warnings: string[] = [];
  if (sections.length === 0) warnings.push("No sections added");
  if (totalLessons === 0) warnings.push("No lessons added");
  if (tasks.length === 0) warnings.push("No tasks added — learners can't earn certificates");

  const handlePublish = async () => {
    if (!savedDomainId) {
      toast.error("Domain hasn't been saved yet");
      return;
    }
    setPublishing(true);
    try {
      await domainApi.publish(savedDomainId);
      toast.success("Domain published! It's now live on the public site.");
      reset();
      router.push("/domains");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setPublishing(false);
    }
  };

  const handleSaveDraft = () => {
    toast.success("Saved as draft. You can continue editing from the Domains list.");
    reset();
    router.push("/domains");
  };

  const slug = details.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  const priceText = details.isFree
    ? "Free"
    : [
        details.priceINR && `₹${details.priceINR}`,
        details.priceMYR && `RM ${details.priceMYR}`,
      ]
        .filter(Boolean)
        .join(" / ") || "No price set";

  const durationText = details.durationOptions
    .map((d) => `${d} month${d > 1 ? "s" : ""}`)
    .join(", ");

  return (
    <div className="space-y-4">
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 px-4 py-3 space-y-1">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p className="text-sm font-medium">Review these before publishing</p>
          </div>
          <ul className="pl-6 space-y-0.5">
            {warnings.map((w) => (
              <li key={w} className="text-xs text-amber-700 dark:text-amber-400 list-disc">{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary */}
      <div className="border border-border rounded-xl divide-y divide-border">
        <ReviewRow
          icon={<BookOpen className="h-4 w-4" />}
          label="domain title"
          value={details.title || "Untitled domain"}
          sub={slug ? `/${slug}` : undefined}
        />
        <ReviewRow
          icon={<IndianRupee className="h-4 w-4" />}
          label="pricing"
          value={priceText}
          sub={`Duration options: ${durationText || "none set"}`}
        />
        <ReviewRow
          icon={<BookOpen className="h-4 w-4" />}
          label="curriculum"
          value={`${sections.length} section${sections.length !== 1 ? "s" : ""} · ${totalLessons} lesson${totalLessons !== 1 ? "s" : ""}`}
          sub={sections.map((s) => s.title).join(", ") || "No sections"}
        />
        <ReviewRow
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="tasks"
          value={
            tasks.length === 0
              ? "No tasks"
              : `${tasks.length} task${tasks.length !== 1 ? "s" : ""} · ${projectCount} project${projectCount !== 1 ? "s" : ""}, ${quizCount} quiz${quizCount !== 1 ? "zes" : ""}`
          }
          sub={requiredTasks > 0 ? `${requiredTasks} required for certificate` : undefined}
        />
        {details.isFeatured && (
          <ReviewRow
            icon={<Globe className="h-4 w-4" />}
            label="visibility"
            value="Featured on homepage"
          />
        )}
      </div>

      {/* Publish bar */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
            Draft — not visible to learners
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Publishing makes this domain live on the public site immediately
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button disabled={publishing || warnings.length > 0} className="flex-shrink-0">
              {publishing ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Publishing…</>
              ) : (
                "Publish domain"
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Publish &quot;{details.title}&quot;?</AlertDialogTitle>
              <AlertDialogDescription>
                This will make the domain live on the public site. Learners will be able to enroll and pay immediately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handlePublish}>Yes, publish</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="flex justify-between pt-2 border-t border-border">
        <Button variant="outline" onClick={() => setStep(2)}>← Back</Button>
        <Button variant="ghost" onClick={handleSaveDraft} className="text-muted-foreground">
          Save as draft & exit
        </Button>
      </div>
    </div>
  );
}
