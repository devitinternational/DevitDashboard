"use client";

import { LoginForm } from "@/components/login-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { GalleryVerticalEndIcon } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEndIcon className="size-4" />
          </div>
          DevIt Dashboard
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}
