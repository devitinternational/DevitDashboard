// src/app/(dashboard)/domains/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Pencil, Globe2, Lock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// In real usage: fetch from your API via server component or React Query
// import { api } from "@/lib/api";

// Placeholder type
interface DomainRow {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  isFree: boolean;
  priceINR: string | null;
  _count: { sections: number; enrollments: number };
  creator: { name: string | null };
}

// ─── Replace this with your real fetch ──────────────────────────────

async function getDomains() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.domain.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      published: true,
      isFree: true,
      priceINR: true,
      createdAt: true,
      _count: { select: { sections: true, enrollments: true } },
      creator: { select: { name: true } },
    },
  });
}

export const metadata = { title: "Domains | Admin Dashboard" };

export default async function DomainsPage() {
  const domains = await getDomains();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Domains</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            All internship tracks — published and drafts
          </p>
        </div>
        <Button asChild>
          <Link href="/domains/new">
            <Plus className="h-4 w-4 mr-2" /> New domain
          </Link>
        </Button>
      </div>

      {/* Empty state */}
      {domains.length === 0 && (
        <div className="border border-dashed border-border rounded-xl py-16 flex flex-col items-center gap-3 text-center">
          <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
            <Globe2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">No domains yet</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Create your first internship track to get started
            </p>
          </div>
          <Button asChild size="sm" className="mt-1">
            <Link href="/domains/new">
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Create domain
            </Link>
          </Button>
        </div>
      )}

      {/* Domain list */}
      {domains.length > 0 && (
        <div className="border border-border rounded-xl divide-y divide-border overflow-hidden">
          {domains.map((domain) => (
            <div
              key={domain.id}
              className="flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium truncate">{domain.title}</p>
                  {domain.published ? (
                    <Badge
                      variant="outline"
                      className="text-xs h-5 px-1.5 text-green-700 border-green-300 bg-green-50 dark:bg-green-900/20 dark:text-green-400"
                    >
                      <Globe2 className="h-2.5 w-2.5 mr-1" /> Live
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-xs h-5 px-1.5 text-muted-foreground"
                    >
                      <Lock className="h-2.5 w-2.5 mr-1" /> Draft
                    </Badge>
                  )}
                  {domain.isFree && (
                    <Badge
                      variant="outline"
                      className="text-xs h-5 px-1.5 text-blue-600 border-blue-300"
                    >
                      Free
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  /{domain.slug} · {domain._count.sections} sections ·{" "}
                  {domain._count.enrollments} enrolled
                  {domain.priceINR &&
                    !domain.isFree &&
                    ` · ₹${domain.priceINR}`}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  asChild
                >
                  <Link href={`/domains/${domain.id}/edit`}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  asChild
                >
                  <Link href={`/domains/${domain.id}`}>
                    <Eye className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
