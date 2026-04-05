import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeSync } from "@/components/theme-sync";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CurrencyInitializer } from "@/components/currency-initializer";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Admin Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={geist.className}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem("devit-theme");
                const theme = stored ? JSON.parse(stored)?.state?.theme : "light";
                const isDark = theme === "dark";
                document.documentElement.classList.toggle("dark", isDark);
                document.documentElement.style.colorScheme = isDark ? "dark" : "light";
              } catch (_) {}
            `,
          }}
        />
        <TooltipProvider>
          <ThemeSync />
          <CurrencyInitializer />
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
