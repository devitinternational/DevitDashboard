import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { DomainBuilderClient } from "@/components/domain-builder/DomainBuilderClient";

async function getDomain(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.domain.findUnique({
    where: { id },
    include: {
      sections: {
        orderBy: { orderIndex: "asc" },
        include: { lessons: { orderBy: { orderIndex: "asc" } } },
      },
      tasks: {
        orderBy: { orderIndex: "asc" },
        include: {
          questions: {
            orderBy: { orderIndex: "asc" },
            include: { options: { orderBy: { orderIndex: "asc" } } },
          },
        },
      },
    },
  });
}

export default async function EditDomainPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const domain = await getDomain(id);
  if (!domain) notFound();

  return (
    <DomainBuilderClient
      mode="edit"
      initialData={{
        savedDomainId: domain.id,
        details: {
          title: domain.title,
          description: domain.description ?? "",
          iconUrl: domain.iconUrl ?? "",
          bannerUrl: domain.bannerUrl ?? "",
          priceINR: domain.priceINR?.toString() ?? "",
          priceMYR: domain.priceMYR?.toString() ?? "",
          isFree: domain.isFree,
          durationOptions: domain.durationOptions,
          isFeatured: domain.isFeatured,
        },
        sections: domain.sections.map((s) => ({
          id: s.id,
          savedId: s.id,
          title: s.title,
          description: s.description ?? "",
          lessons: s.lessons.map((l) => ({
            id: l.id,
            savedId: l.id,
            title: l.title,
            description: l.description ?? "",
            contentType: l.contentType,
            externalUrl: l.externalUrl ?? "",
            articleContent: l.articleContent ?? "",
            isFree: l.isFree,
            videoKey: l.videoKey ?? undefined,
          })),
        })),
        tasks: domain.tasks.map((t) => ({
          id: t.id,
          savedId: t.id,
          title: t.title,
          description: t.description ?? "",
          taskType: t.taskType,
          isRequired: t.isRequired,
          passingScore: t.passingScore ?? 70,
          questions: t.questions.map((q) => ({
            id: q.id,
            question: q.question,
            explanation: q.explanation ?? "",
            options: q.options.map((o) => ({
              id: o.id,
              text: o.text,
              isCorrect: o.isCorrect,
            })),
          })),
        })),
      }}
    />
  );
}