import { auth } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex min-h-svh flex-col">
        <SiteHeader />
        <div className="flex min-h-0 flex-1">
          <AppSidebar
            user={{
              name: session.user.name ?? "Admin",
              email: session.user.email ?? "",
              avatar: session.user.image ?? "/devitbig.png",
              role: session.user.role,
            }}
          />
          <SidebarInset className="min-h-0 overflow-hidden">
            <div className="flex min-h-0 flex-1 flex-col overflow-auto p-4">
              {children}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
