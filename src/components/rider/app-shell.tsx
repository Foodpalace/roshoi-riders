import { Link, useRouterState } from "@tanstack/react-router";
import { RedirectToSignIn, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useI18n } from "@/lib/rider/i18n-context";
import { DEFAULT_BRANDING } from "@/lib/rider/config";
import { cn } from "@/lib/utils";
import {
  Banknote,
  Bike,
  CircleHelp,
  History,
  House,
  Shield,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const { t } = useI18n();
  const [online, setOnline] = useState(true);
  const [geoOk, setGeoOk] = useState(true);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    setOnline(navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    const handler = (ev: Event) => {
      const d = (ev as CustomEvent<{ ok: boolean }>).detail;
      setGeoOk(d.ok);
    };
    window.addEventListener("roshoi-geo", handler);
    return () => window.removeEventListener("roshoi-geo", handler);
  }, []);

  if (isPending) {
    return (
      <div className="mx-auto min-h-dvh max-w-lg p-4">
        <p className="font-display text-2xl">Roshoi Partner</p>
        <Skeleton className="mt-4 h-16 w-40" />
        <Skeleton className="mt-6 h-48 w-full rounded-xl" />
        <Skeleton className="mt-4 h-24 w-full rounded-xl" />
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;

  const nav = [
    { to: "/", icon: House, label: t("home") },
    { to: "/earnings", icon: Banknote, label: t("earnings") },
    { to: "/history", icon: History, label: t("history") },
    { to: "/safety", icon: Shield, label: t("safety") },
    { to: "/profile", icon: Bike, label: t("profile") },
  ] as const;

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="bg-sim px-4 py-2 text-center text-xs font-medium tracking-wide text-primary-foreground">
        {t("simulatedBanner")}
      </div>
      {!online ? (
        <div className="bg-offline px-4 py-2 text-center text-sm text-primary-foreground">
          {t("connectionLost")} — {t("connectionLostBody")}
        </div>
      ) : null}
      {!geoOk ? (
        <div className="bg-busy px-4 py-2 text-center text-sm text-primary-foreground">
          {t("locationUnavailable")}
        </div>
      ) : null}
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={DEFAULT_BRANDING.logoUrl} alt="" className="size-9 rounded-md" />
          <div>
            <p className="font-display text-lg leading-none">{DEFAULT_BRANDING.riderFacingBrand}</p>
            <p className="text-xs text-muted-foreground">{DEFAULT_BRANDING.tagline}</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Badge tone="sim">{t("simulated")}</Badge>
          <Link to="/support" className="grid size-11 place-items-center rounded-md hover:bg-muted" aria-label={t("support")}>
            <CircleHelp className="size-5" />
          </Link>
          <div className="hidden sm:block">
            <UserButton />
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-5xl gap-6 px-4 pb-28 lg:grid-cols-[1fr_18rem] lg:pb-8">
        <main>{children}</main>
        <aside className="hidden lg:block">
          <div className="sticky top-4 space-y-2 rounded-xl bg-card p-3 shadow-[var(--shadow-border)]">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex min-h-11 items-center gap-2 rounded-md px-3 text-sm",
                  path === item.to ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
            <Link to="/assistant" className="flex min-h-11 items-center gap-2 rounded-md px-3 text-sm hover:bg-muted">
              {t("assistant")}
            </Link>
          </div>
        </aside>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {nav.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-[11px]",
                  path === item.to ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
