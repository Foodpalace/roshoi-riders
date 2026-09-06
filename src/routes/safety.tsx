import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/rider/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardMeta, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DEFAULT_CONFIG } from "@/lib/rider/config";
import { errorMessage } from "@/lib/client/errors";
import { useI18n } from "@/lib/rider/i18n-context";
import { reportSafetyFn } from "@/lib/server/rider-fns";
import type { SafetyKind } from "@/lib/rider/types";
import { Phone, Share2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/safety")({ component: Page });

const KINDS: SafetyKind[] = [
  "UNSAFE_SITUATION",
  "ROAD_BLOCKAGE",
  "ACCIDENT",
  "CUSTOMER_ISSUE",
  "RESTAURANT_ISSUE",
  "PLATFORM_SUPPORT",
];

function Page() {
  const { t } = useI18n();
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function report(kind: SafetyKind) {
    try {
      let lat: number | null = null;
      let lng: number | null = null;
      if (navigator.geolocation) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (p) => {
              lat = p.coords.latitude;
              lng = p.coords.longitude;
              resolve();
            },
            () => resolve(),
            { timeout: 4000 },
          );
        });
      }
      const row = await reportSafetyFn({ data: { kind, note, lat, lng } });
      setStatus(row.id);
      setError(null);
    } catch (e) {
      setError(errorMessage(e, t("actionNotConfirmed")));
    }
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <h1 className="font-display text-3xl">{t("safety")}</h1>
        <Card>
          <CardTitle>{t("emergency")}</CardTitle>
          <CardMeta className="mt-2">{t("emergencyNote")}</CardMeta>
          <Button asChild size="lg" className="mt-4 w-full" variant="destructive">
            <a href={`tel:${DEFAULT_CONFIG.emergencyPhone}`}>
              <Phone className="size-4" />
              {DEFAULT_CONFIG.emergencyPhone}
            </a>
          </Button>
          <Button asChild variant="outline" className="mt-2 w-full">
            <a href={`tel:${DEFAULT_CONFIG.supportPhone}`}>{t("support")}</a>
          </Button>
        </Card>
        <Card className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              const url = window.location.origin;
              if (navigator.share) void navigator.share({ title: "Roshoi location", url });
              else void report("SHARE_LOCATION");
            }}
          >
            <Share2 className="size-4" />
            {t("shareLocation")}
          </Button>
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("message")} />
          {KINDS.map((k) => (
            <Button key={k} variant="outline" className="w-full" onClick={() => void report(k)}>
              {k.replaceAll("_", " ")}
            </Button>
          ))}
          {status ? <p className="text-sm">{t("ticketRef")} {status.slice(0, 8)}</p> : null}
          {error ? <p className="text-sm text-offline">{error}</p> : null}
        </Card>
      </div>
    </AppShell>
  );
}
