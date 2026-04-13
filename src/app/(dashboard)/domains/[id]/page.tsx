import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Globe2,
  Lock,
  BookOpen,
  CheckCircle2,
  Users,
  Pencil,
} from "lucide-react";

async function getDomain(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.domain.findUnique({
    where: { id },
    include: {
      creator: { select: { name: true, email: true } },
      sections: {
        orderBy: { orderIndex: "asc" },
        include: {
          lessons: { orderBy: { orderIndex: "asc" } },
        },
      },
      tasks: {
        orderBy: { orderIndex: "asc" },
        include: {
          questions: {
            include: { options: true },
          },
        },
      },
      _count: { select: { enrollments: true } },
    },
  });
}

export default async function DomainDetailPage({
  params,
}: {
  params: Promise<{ id: string }>; 
}) {
  const { id } = await params;
  const domain = await getDomain(id);
  if (!domain) notFound();

  const totalLessons = domain.sections.reduce(
    (acc, s) => acc + s.lessons.length,
    0,
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/domains">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {domain.title}
            </h1>
            {domain.published ? (
              <Badge
                variant="outline"
                className="text-green-700 border-green-300 bg-green-50"
              >
                <Globe2 className="h-3 w-3 mr-1" /> Live
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                <Lock className="h-3 w-3 mr-1" /> Draft
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">/{domain.slug}</p>
        </div>
        <Button asChild>
          <Link href={`/domains/${domain.id}/edit`}>
            <Pencil className="h-4 w-4 mr-2" /> Edit
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: BookOpen, label: "Sections", value: domain.sections.length },
          { icon: BookOpen, label: "Lessons", value: totalLessons },
          { icon: CheckCircle2, label: "Tasks", value: domain.tasks.length },
        ].map((stat) => (
          <div
            key={stat.label}
            className="border border-border rounded-xl p-4 bg-muted/30"
          >
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-semibold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Pricing */}
      <div className="border border-border rounded-xl p-5 space-y-1">
        <p className="text-sm font-medium">Pricing</p>
        <p className="text-sm text-muted-foreground">
          {domain.isFree
            ? "Free"
            : `₹${domain.priceINR ?? "—"} / RM ${domain.priceMYR ?? "—"}`}
          {" · "}
          Duration: {domain.durationOptions.map((d) => `${d}mo`).join(", ")}
        </p>
      </div>

      {/* Curriculum */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/30">
          <p className="text-sm font-medium">Curriculum</p>
        </div>
        {domain.sections.length === 0 ? (
          <p className="text-sm text-muted-foreground px-5 py-4">
            No sections yet
          </p>
        ) : (
          domain.sections.map((section) => (
            <div
              key={section.id}
              className="border-b border-border last:border-0"
            >
              <div className="px-5 py-3 bg-muted/10">
                <p className="text-sm font-medium">{section.title}</p>
                <p className="text-xs text-muted-foreground">
                  {section.lessons.length} lessons
                </p>
              </div>
              {section.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="px-5 py-2.5 flex items-center gap-3 border-t border-border/50"
                >
                  <Badge
                    variant="outline"
                    className="text-xs h-5 px-1.5 flex-shrink-0"
                  >
                    {lesson.contentType === "EXTERNAL_VIDEO"
                      ? "Video"
                      : lesson.contentType === "VIDEO_UPLOAD"
                        ? "Upload"
                        : "Article"}
                  </Badge>
                  <span className="text-sm">{lesson.title}</span>
                  {lesson.isFree && (
                    <Badge
                      variant="outline"
                      className="text-xs h-5 px-1.5 text-green-600 border-green-300 ml-auto"
                    >
                      preview
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Tasks */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/30">
          <p className="text-sm font-medium">Tasks</p>
        </div>
        {domain.tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground px-5 py-4">
            No tasks yet
          </p>
        ) : (
          domain.tasks.map((task) => (
            <div
              key={task.id}
              className="px-5 py-3 border-b border-border last:border-0 flex items-center gap-3"
            >
              <Badge
                variant="outline"
                className={`text-xs h-5 px-1.5 ${
                  task.taskType === "QUIZ"
                    ? "text-purple-700 border-purple-300"
                    : "text-amber-700 border-amber-300"
                }`}
              >
                {task.taskType === "QUIZ" ? "Quiz" : "Project"}
              </Badge>
              <span className="text-sm flex-1">{task.title}</span>
              {task.taskType === "QUIZ" && (
                <span className="text-xs text-muted-foreground">
                  {task.questions.length} questions · pass {task.passingScore}%
                </span>
              )}
              {task.isRequired && (
                <Badge
                  variant="outline"
                  className="text-xs h-5 px-1.5 text-muted-foreground"
                >
                  required
                </Badge>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
