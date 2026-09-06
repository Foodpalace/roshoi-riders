import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/rider/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardMeta, CardTitle } from "@/components/ui/card";
import { errorMessage } from "@/lib/client/errors";
import { formatPaise } from "@/lib/rider/money";
import { useI18n } from "@/lib/rider/i18n-context";
import { getEarningsFn, getSettlementsFn } from "@/lib/server/rider-fns";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/earnings")({ component: Page });

type Preset = "today" | "yesterday" | "week" | "month";

function Page() {
  const { t } = useI18n();
  const [preset, setPreset] = useState<Preset>("today");
  const [data, setData] = useState<Awaited<ReturnType<typeof getEarningsFn>> | null>(null);
  const [settlements, setSettlements] = useState<Awaited<ReturnType<typeof getSettlementsFn>>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getEarningsFn({ data: { preset } })
      .then(setData)
      .catch((e) => setError(errorMessage(e, t("connectionLostBody"))));
    void getSettlementsFn().then(setSettlements).catch(() => undefined);
  }, [preset, t]);

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl">{t("earnings")}</h1>
          <Badge tone="sim">{t("simulated")}</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["today", "yesterday", "week", "month"] as const).map((p) => (
            <Button key={p} size="sm" variant={preset === p ? "default" : "outline"} onClick={() => setPreset(p)}>
              {p === "today" ? t("today") : p === "yesterday" ? t("yesterday") : p === "week" ? t("thisWeek") : t("thisMonth")}
            </Button>
          ))}
        </div>
        {error ? <p className="text-sm text-offline">{error}</p> : null}
        {data ? (
          <Card>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("netPayable")}</p>
            <p className="font-display text-4xl tabular-nums">{formatPaise(data.totals.netPayable)}</p>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <Row k={t("payout")} v={formatPaise(data.totals.payout)} />
              <Row k={t("incentive")} v={formatPaise(data.totals.incentive)} />
              <Row k={t("adjustment")} v={formatPaise(data.totals.adjustment)} />
              <Row k={t("deduction")} v={formatPaise(data.totals.deduction)} />
              <Row k={t("cashCollectedLabel")} v={formatPaise(data.totals.cashCollected)} />
              <Row k={t("cashReconciled")} v={formatPaise(data.totals.cashReconciled)} />
            </dl>
            <CardMeta className="mt-3">{t("simulatedBanner")}</CardMeta>
          </Card>
        ) : null}
        <Card>
          <CardTitle>{t("statement")}</CardTitle>
          <ul className="mt-3 space-y-2">
            {data?.lines.map((l) => (
              <li key={l.id} className="flex items-center justify-between text-sm">
                <span>
                  {l.orderCode ?? l.kind} · {l.note}
                </span>
                <span className="tabular-nums">{formatPaise(l.amountPaise)}</span>
              </li>
            ))}
            {data && data.lines.length === 0 ? (
              <li className="text-sm text-muted-foreground">{t("noHistory")}</li>
            ) : null}
          </ul>
        </Card>
        <Card>
          <CardTitle>{t("settlements")}</CardTitle>
          <ul className="mt-3 space-y-2">
            {settlements.map((s) => (
              <li key={s.id} className="flex items-center justify-between text-sm">
                <span>
                  {s.periodStart} → {s.periodEnd}
                </span>
                <span className="tabular-nums">
                  {formatPaise(s.amountPaise)} · {s.status}
                  {s.status === "PAID" && !s.confirmedPaidAt ? " (unconfirmed)" : ""}
                </span>
              </li>
            ))}
          </ul>
          <Link to="/history" className="mt-3 inline-block text-sm underline">
            {t("history")}
          </Link>
        </Card>
      </div>
    </AppShell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="tabular-nums">{v}</dd>
    </div>
  );
}
