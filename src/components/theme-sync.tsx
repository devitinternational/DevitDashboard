"use client";

import { useEffect } from "react";

import { useThemeStore } from "@/store/theme-store";

export function ThemeSync() {
  const theme = useThemeStore((state) => state.theme);
  const hydrated = useThemeStore((state) => state.hydrated);

  useEffect(() => {
    void useThemeStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  }, [hydrated, theme]);

  return null;
}
