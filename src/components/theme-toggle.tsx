"use client";

import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/store/theme-store";
import { MoonIcon, SunIcon } from "lucide-react";

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const hydrated = useThemeStore((state) => state.hydrated);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="size-8"
      onClick={toggleTheme}
      disabled={!hydrated}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <SunIcon className="size-4" />
      ) : (
        <MoonIcon className="size-4" />
      )}
    </Button>
  );
}
