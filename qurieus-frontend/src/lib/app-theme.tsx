"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/** Matches next-themes defaults used in this app. */
export const THEME_STORAGE_KEY = "theme";

function readResolvedThemeFromDocument(): "light" | "dark" {
  if (typeof document === "undefined") {
    return "light";
  }
  const el = document.documentElement;
  if (el.classList.contains("dark")) {
    return "dark";
  }
  if (el.classList.contains("light")) {
    return "light";
  }
  return "light";
}

export type AppThemeContextValue = {
  theme?: string;
  resolvedTheme?: string;
  themes: string[];
  systemTheme?: "light" | "dark";
  setTheme: React.Dispatch<React.SetStateAction<string | undefined>>;
};

const FALLBACK_CTX: AppThemeContextValue = {
  theme: undefined,
  resolvedTheme: undefined,
  themes: [],
  systemTheme: undefined,
  setTheme: () => {},
};

const ThemeContext = createContext<AppThemeContextValue | undefined>(
  undefined
);

type Props = {
  children: ReactNode;
  /** Tailwind-style class attributes for light/dark */
  attribute?: "class";
  enableColorScheme?: boolean;
  defaultTheme?: string;
  storageKey?: string;
};

export function ThemeProvider({
  children,
  attribute = "class",
  enableColorScheme = false,
  defaultTheme = "light",
  storageKey = THEME_STORAGE_KEY,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [theme, setThemeState] = useState<string | undefined>(undefined);

  const applyDom = useCallback(
    (name: string) => {
      if (typeof document === "undefined") {
        return;
      }
      const root = document.documentElement;
      if (attribute === "class") {
        root.classList.remove("light", "dark");
        root.classList.add(name);
      }
      if (enableColorScheme && (name === "light" || name === "dark")) {
        root.style.colorScheme = name;
      }
    },
    [attribute, enableColorScheme]
  );

  useLayoutEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(storageKey);
    } catch {
      /* private mode etc. */
    }
    const next =
      stored === "dark" || stored === "light" ? stored : defaultTheme;
    // Re-apply immediately after hydration; the inline head script may get overwritten when <html> had a React className (now removed).
    applyDom(next);
    setThemeState(next);
    setMounted(true);
  }, [storageKey, defaultTheme, applyDom]);

  useLayoutEffect(() => {
    if (!mounted || theme === undefined) {
      return;
    }
    try {
      localStorage.setItem(storageKey, theme);
    } catch {
      /* noop */
    }
    applyDom(theme);
  }, [mounted, theme, storageKey, applyDom]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key !== storageKey || !e.newValue) {
        return;
      }
      if (e.newValue === "light" || e.newValue === "dark") {
        setThemeState(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [storageKey]);

  const setTheme = useCallback(
    (value: React.SetStateAction<string | undefined>) => {
      setThemeState((prev) => {
        const resolved =
          typeof value === "function" ? value(prev) : value ?? defaultTheme;
        return resolved === "dark" || resolved === "light"
          ? resolved
          : defaultTheme;
      });
    },
    [defaultTheme]
  );

  const value = useMemo<AppThemeContextValue>(
    () => ({
      theme: mounted ? theme : undefined,
      // Before mount, derive from DOM (inline layout script applies class before React hydrates).
      resolvedTheme:
        mounted && theme !== undefined
          ? (theme === "dark" ? "dark" : "light")
          : readResolvedThemeFromDocument(),
      setTheme,
      themes: ["light", "dark"],
      systemTheme: undefined,
    }),
    [mounted, theme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): AppThemeContextValue {
  return useContext(ThemeContext) ?? FALLBACK_CTX;
}
