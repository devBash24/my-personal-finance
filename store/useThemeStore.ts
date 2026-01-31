import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const THEMES = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "ocean", label: "Ocean" },
  { id: "forest", label: "Forest" },
  { id: "sunset", label: "Sunset" },
  { id: "barbie", label: "Barbie" },
  { id: "sky", label: "Sky" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

interface ThemeState {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "finance-theme-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
