import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/rider/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { errorMessage } from "@/lib/client/errors";
import { formatPaise } from "@/lib/rider/money";
import { useI18n } from "@/lib/rider/i18n-context";
import { getHistoryFn, getPerformanceFn } from "@/lib/server/rider-fns";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/history")({ component: Page });

function Page() {
  const { t } = useI18n();
  const [preset, setPreset] = useState<"today" | "yesterday" | "week" | "month">("week");
  const [rows, setRows] = useState<Awaited<ReturnType<typeof getHistoryFn>>>([]);
  const [perf, setPerf] = useState<Awaited<ReturnType<typeof getPerformanceFn>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getHistoryFn({ data: { preset } })
      .then(setRows)
      .catch((e) => setError(errorMessage(e, t("connectionLostBody"))));
    void getPerformanceFn().then(setPerf).catch(() => undefined);
  }, [preset, t]);

  return (
    <AppShell>
      <div className="space-y-4">
        <h1 className="font-display text-3xl">{t("history")}</h1>
        <div className="flex flex-wrap gap-2">
          {(["today", "yesterday", "week", "month"] as const).map((p) => (
            <Button key={p} size="sm" variant={preset === p ? "default" : "outline"} onClick={() => setPreset(p)}>
              {p === "today" ? t("today") : p === "yesterday" ? t("yesterday") : p === "week" ? t("thisWeek") : t("thisMonth")}
            </Button>
          ))}
        </div>
        {perf ? (
          <Card className="grid grid-cols-2 gap-3 text-sm">
            <p>{t("completed")}: <span className="tabular-nums">{perf.completed}</span></p>
            <p>{t("acceptanceRate")}: <span className="tabular-nums">{pct(perf.accepted, perf.offered)}</span></p>
            <p>{t("cancelRate")}: <span className="tabular-nums">{pct(perf.cancelled, perf.accepted)}</span></p>
            <p>{t("perOrder")}: <span className="tabular-nums">{formatPaise(perf.earningsPerOrderPaise)}</span></p>
          </Card>
        ) : null}
        {error ? <p className="text-sm text-offline">{error}</p> : null}
        {rows.length === 0 ? <p className="text-sm text-muted-foreground">{t("noHistory")}</p> : null}
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.delivery.id}>
              <Link to="/delivery/$id" params={{ id: r.delivery.id }}>
                <Card className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{r.delivery.orderCode}</p>
                    <p className="text-sm text-muted-foreground">
                      {r.delivery.restaurant.name} · {r.delivery.customer.area}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge tone="muted">{r.delivery.state}</Badge>
                    <p className="mt-1 tabular-nums text-sm">{formatPaise(r.payout)}</p>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}

function pct(n: number, d: number) {
  if (!d) return "—";
  return `${Math.round((n / d) * 100)}%`;
}
