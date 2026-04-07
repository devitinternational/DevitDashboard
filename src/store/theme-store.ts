"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark";

type ThemeState = {
  theme: ThemeMode;
  hydrated: boolean;
  setTheme: (theme: ThemeMode) => void;
  setHydrated: (hydrated: boolean) => void;
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      hydrated: false,
      setTheme: (theme) => set({ theme }),
      setHydrated: (hydrated) => set({ hydrated }),
      toggleTheme: () =>
        set({ theme: get().theme === "dark" ? "light" : "dark" }),
    }),
    {
      name: "devit-theme",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
