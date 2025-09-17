import {
  HeroUIProvider,
  type HeroUIProviderProps,
} from "@heroui/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "memo-theme";

export type ThemePreference = "light" | "dark" | "system";
export type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const getStoredPreference = (): ThemePreference => {
  if (typeof window === "undefined") {
    return "system";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }

  return "system";
};

const getSystemMode = (): ThemeMode => {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

type ThemeProviderProps = {
  children: React.ReactNode;
  heroUIProps?: Omit<HeroUIProviderProps, "children">;
};

export const ThemeProvider = ({
  children,
  heroUIProps,
}: ThemeProviderProps) => {
  const [preference, setPreferenceState] = useState<ThemePreference>(() =>
    getStoredPreference(),
  );
  const [systemMode, setSystemMode] = useState<ThemeMode>(() => getSystemMode());

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (event: MediaQueryListEvent) => {
      setSystemMode(event.matches ? "dark" : "light");
    };

    setSystemMode(media.matches ? "dark" : "light");
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const mode: ThemeMode = preference === "system" ? systemMode : preference;

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;
    root.classList.toggle("dark", mode === "dark");
    root.dataset.theme = mode;
    root.style.colorScheme = mode;
  }, [mode]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, preference);
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
  }, []);

  const value = useMemo(
    () => ({
      mode,
      preference,
      setPreference,
    }),
    [mode, preference, setPreference],
  );

  return (
    <ThemeContext.Provider value={value}>
      <HeroUIProvider {...heroUIProps}>{children}</HeroUIProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
