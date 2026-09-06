import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/rider/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardMeta, CardTitle } from "@/components/ui/card";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { LOCALE_LABELS } from "@/lib/rider/i18n";
import { useI18n } from "@/lib/rider/i18n-context";
import { DEFAULT_BRANDING, DEFAULT_FLAGS } from "@/lib/rider/config";
import { bootstrapRiderFn, setLocaleFn } from "@/lib/server/rider-fns";
import type { LocaleCode, RiderProfile } from "@/lib/rider/types";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/profile")({ component: Page });

function Page() {
  const user = useCurrentUser();
  const { t, locale, setLocale } = useI18n();
  const [rider, setRider] = useState<RiderProfile | null>(null);

  useEffect(() => {
    void bootstrapRiderFn().then(setRider).catch(() => undefined);
  }, []);

  return (
    <AppShell>
      <div className="space-y-4">
        <h1 className="font-display text-3xl">{t("profile")}</h1>
        <Card className="flex items-center justify-between">
          <div>
            <CardTitle>{rider?.fullName || user?.displayName || "Partner"}</CardTitle>
            <CardMeta>{rider?.phone || user?.primaryEmail}</CardMeta>
          </div>
          <UserButton />
        </Card>
        <Card className="space-y-2">
          <div className="flex items-center justify-between">
            <span>{t("kyc")}</span>
            <Badge tone={rider?.kycStatus === "VERIFIED" ? "online" : "busy"}>
              {rider?.kycStatus ?? "DRAFT"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {rider?.vehicleType} · {rider?.vehicleRegistration || "—"}
          </p>
          <Link to="/onboarding" className="text-sm underline">
            {t("kyc")}
          </Link>
        </Card>
        <Card>
          <CardTitle>{t("language")}</CardTitle>
          <div className="mt-3 flex flex-wrap gap-2">
            {(Object.keys(LOCALE_LABELS) as LocaleCode[]).map((code) => (
              <Button
                key={code}
                size="sm"
                variant={locale === code ? "default" : "outline"}
                onClick={() => {
                  setLocale(code);
                  void setLocaleFn({ data: { locale: code } });
                }}
              >
                {LOCALE_LABELS[code]}
              </Button>
            ))}
          </div>
        </Card>
        <Card>
          <CardTitle>{DEFAULT_BRANDING.appName}</CardTitle>
          <CardMeta className="mt-2">
            {DEFAULT_BRANDING.legalCompanyName} · {DEFAULT_BRANDING.domain}
          </CardMeta>
          <p className="mt-3 text-xs text-muted-foreground">{t("legalNote")}</p>
          <ul className="mt-3 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
            {Object.entries(DEFAULT_FLAGS).map(([k, v]) => (
              <li key={k}>
                {k}: {v ? "on" : "off"}
              </li>
            ))}
          </ul>
        </Card>
        <Link to="/assistant" className="inline-block text-sm underline">
          {t("assistant")}
        </Link>
      </div>
    </AppShell>
  );
}
