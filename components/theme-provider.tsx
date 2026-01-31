"use client";

import { useEffect } from "react";
import {
  useThemeStore,
  THEMES,
  type ThemeId,
} from "@/store/useThemeStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    fetch("/api/user/theme")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data: { theme?: string } | null) => {
        const t = data?.theme;
        if (t && THEMES.some((x) => x.id === t)) {
          setTheme(t as ThemeId);
        }
      })
      .catch(() => {
        /* unauthenticated or network error - use store/localStorage */
      });
  }, [setTheme]);

  return <>{children}</>;
}
