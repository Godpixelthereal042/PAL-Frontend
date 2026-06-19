"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Force dark theme attribute on <html> element
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", "dark");
  }, [mounted]);

  const toggleTheme = useCallback(() => {}, []);
  const setTheme = useCallback(() => {}, []);

  return (
    <ThemeContext.Provider value={{ theme: "dark", toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
