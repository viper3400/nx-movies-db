"use client";

import * as React from "react";

type ThemeMode = "light" | "dark";

export interface ThemeProviderProps {
  children: React.ReactNode;
  /**
   * DOM attribute to update with the current theme.
   * Defaults to "class" to match Tailwind conventions.
   */
  attribute?: string;
  /**
   * Theme used before we know the user's preference.
   */
  defaultTheme?: ThemeMode;
  /**
   * LocalStorage key. When undefined, persistence is disabled.
   */
  storageKey?: string | null;
  /**
   * Whether to follow the OS color scheme when the user
   * has not picked a theme manually.
   */
  enableSystem?: boolean;
}

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (value: ThemeMode) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);
const DEFAULT_STORAGE_KEY = "nx-movies-theme";

const getSystemTheme = (): ThemeMode =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "light",
  storageKey = DEFAULT_STORAGE_KEY,
  enableSystem = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<ThemeMode>(defaultTheme);

  const applyTheme = React.useCallback(
    (value: ThemeMode) => {
      if (typeof document === "undefined") {
        return;
      }

      const root = document.documentElement;

      if (attribute === "class") {
        root.classList.remove("light", "dark");
        root.classList.add(value);
        return;
      }

      if (attribute) {
        root.setAttribute(attribute, value);
      }
    },
    [attribute],
  );

  const persistTheme = React.useCallback(
    (value: ThemeMode, persist: boolean) => {
      setThemeState(value);
      applyTheme(value);

      if (persist && storageKey && typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, value);
      }
    },
    [applyTheme, storageKey],
  );

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedValue = storageKey
      ? (window.localStorage.getItem(storageKey) as ThemeMode | null)
      : null;
    const initialTheme =
      storedValue ?? (enableSystem ? getSystemTheme() : defaultTheme);

    persistTheme(initialTheme, Boolean(storedValue));
  }, [defaultTheme, enableSystem, persistTheme, storageKey]);

  React.useEffect(() => {
    if (!enableSystem || typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (storageKey && window.localStorage.getItem(storageKey)) {
        return;
      }

      persistTheme(media.matches ? "dark" : "light", false);
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [enableSystem, persistTheme, storageKey]);

  const setTheme = React.useCallback(
    (value: ThemeMode) => {
      persistTheme(value, true);
    },
    [persistTheme],
  );

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [theme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
