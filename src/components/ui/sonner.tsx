"use client";

import { Toaster } from "sonner";

export function Sonner() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "rounded-xl border bg-card text-card-foreground shadow-lg",
          title: "text-sm font-medium",
          description: "text-sm text-muted-foreground",
        },
      }}
    />
  );
}
