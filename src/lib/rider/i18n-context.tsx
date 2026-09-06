import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { t as translate, type MessageKey } from "./i18n.ts";
import type { LocaleCode } from "./types.ts";

const KEY = "roshoi.locale";

function readLocale(): LocaleCode {
  if (typeof window === "undefined") return "en";
  const v = window.localStorage.getItem(KEY);
  if (v === "bn" || v === "en" || v === "as" || v === "hi") return v;
  return "en";
}

const Ctx = createContext<{
  locale: LocaleCode;
  t: (key: MessageKey) => string;
  setLocale: (l: LocaleCode) => void;
}>({
  locale: "en",
  t: (k) => translate("en", k),
  setLocale: () => undefined,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>("en");
  useEffect(() => {
    setLocaleState(readLocale());
  }, []);
  const value = useMemo(
    () => ({
      locale,
      t: (key: MessageKey) => translate(locale, key),
      setLocale: (l: LocaleCode) => {
        setLocaleState(l);
        try {
          window.localStorage.setItem(KEY, l);
        } catch {
          /* ignore */
        }
      },
    }),
    [locale],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  return useContext(Ctx);
}
