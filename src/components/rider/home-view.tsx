import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardMeta, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { errorMessage, newIdempotencyKey } from "@/lib/client/errors";
import { formatPaise } from "@/lib/rider/money";
import { useI18n } from "@/lib/rider/i18n-context";
import { getHomeFn, respondOfferFn, setStatusFn } from "@/lib/server/rider-fns";
import type { DispatchOffer } from "@/lib/rider/types";
import { Link } from "@tanstack/react-router";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { Clock3, Wallet } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "./confirm-dialog";
import { MapPane } from "./map-pane";
import { DeliveryActions } from "./delivery-actions";
import { useDutyLocation } from "./use-duty-location";

type Home = Awaited<ReturnType<typeof getHomeFn>>;

export function HomeView() {
  const { t } = useI18n();
  const user = useCurrentUser();
  const [home, setHome] = useState<Home | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirm, setConfirm] = useState<"online" | "offline" | "decline" | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [now, setNow] = useState(Date.now());

  const load = useCallback(async () => {
    try {
      const data = await getHomeFn();
      setHome(data);
      setError(null);
    } catch (e) {
      setError(errorMessage(e, t("connectionLostBody")));
    }
  }, [t]);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 5000);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  useDutyLocation(
    Boolean(home && (home.rider.status !== "OFFLINE" || home.active)),
    home?.active?.id ?? null,
    20,
  );

  if (!home && !error) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }
  if (!home) {
    return (
      <Card>
        <CardTitle>{t("connectionLost")}</CardTitle>
        <CardMeta className="mt-2">{error}</CardMeta>
        <Button className="mt-4" onClick={() => void load()}>
          {t("retry")}
        </Button>
      </Card>
    );
  }

  const status = home.active ? "BUSY" : home.rider.status;
  const remaining = home.offer
    ? Math.max(0, Math.ceil((new Date(home.offer.expiresAt).getTime() - now) / 1000))
    : 0;
  const onlineMs = home.onlineSince ? now - new Date(home.onlineSince).getTime() : 0;
  const kyc = home.rider.kycStatus;

  async function go(statusNext: "ONLINE" | "OFFLINE") {
    setPending(true);
    try {
      await setStatusFn({ data: { status: statusNext, confirmed: true } });
      await load();
    } catch (e) {
      setError(errorMessage(e, t("actionNotConfirmed")));
    } finally {
      setPending(false);
      setConfirm(null);
    }
  }

  async function respond(decision: "ACCEPT" | "DECLINE", offer: DispatchOffer) {
    setPending(true);
    try {
      await respondOfferFn({
        data: {
          offerId: offer.id,
          decision,
          reason: declineReason || undefined,
          idempotencyKey: newIdempotencyKey(),
        },
      });
      await load();
    } catch (e) {
      setError(errorMessage(e, t("offerGone")));
    } finally {
      setPending(false);
      setConfirm(null);
    }
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-md bg-offline/10 px-3 py-2 text-sm text-offline">{error}</p>
      ) : null}

      <section className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("welcome")}</p>
            <h1 className="mt-1 font-display text-3xl leading-none">
              {home.rider.fullName || user?.displayName || "Partner"}
            </h1>
          </div>
          <StatusPill status={status} online={t("online")} offline={t("offline")} busy={t("busy")} />
        </div>
        {kyc !== "VERIFIED" ? (
          <p className="mt-3 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            {kyc === "UNDER_REVIEW" ? t("underReview") : t("kycHint")} {t("practiceMode")}
          </p>
        ) : null}
        <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
          <Stat label={t("todayEarnings")} value={formatPaise(home.todayEarningsPaise)} />
          <Stat label={t("completed")} value={String(home.completedToday)} />
          <Stat
            label={t("onlineFor")}
            value={status === "OFFLINE" ? "—" : formatDuration(onlineMs)}
          />
        </dl>
        {home.pendingCashPaise > 0 ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-cod">
            <Wallet className="size-4" />
            {t("pendingCash")}: {formatPaise(home.pendingCashPaise)}
          </p>
        ) : null}
        <div className="mt-5">
          {status === "OFFLINE" ? (
            <Button size="lg" className="w-full" variant="online" disabled={pending} onClick={() => setConfirm("online")}>
              {t("goOnline")}
            </Button>
          ) : (
            <Button
              size="lg"
              className="w-full"
              variant="outline"
              disabled={pending || Boolean(home.active)}
              onClick={() => setConfirm("offline")}
            >
              {t("goOffline")}
            </Button>
          )}
        </div>
      </section>

      {home.active ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl">{t("currentDelivery")}</h2>
            <Badge tone="busy">{home.active.state.replaceAll("_", " ")}</Badge>
          </div>
          <MapPane
            pickup={home.active.pickupLocation}
            drop={home.active.dropLocation}
            pickupLabel={home.active.restaurant.name}
            dropLabel={home.active.customer.area}
            navigateLabel={t("mapsOpen")}
          />
          <DeliveryActions
            delivery={home.active}
            cash={home.cash}
            simulatedOtp={home.simulatedOtp}
            onChanged={() => void load()}
          />
        </section>
      ) : home.offer && remaining > 0 ? (
        <OfferCard
          offer={home.offer}
          remaining={remaining}
          pending={pending}
          onAccept={() => void respond("ACCEPT", home.offer!)}
          onDecline={() => setConfirm("decline")}
        />
      ) : (
        <Card>
          <CardTitle>{t("offers")}</CardTitle>
          <CardMeta className="mt-2">{status === "ONLINE" ? t("noOffers") : t("homeEmpty")}</CardMeta>
        </Card>
      )}

      {home.notifications.length ? (
        <Card>
          <CardTitle>{t("alerts")}</CardTitle>
          <ul className="mt-3 space-y-2">
            {home.notifications.slice(0, 4).map((n) => (
              <li key={n.id} className="text-sm">
                <p className="font-medium">{n.title}</p>
                <p className="text-muted-foreground">{n.body}</p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <div className="flex gap-2 text-sm">
        <Link to="/assistant" className="underline">
          {t("assistant")}
        </Link>
        <span className="text-muted-foreground">·</span>
        <Link to="/onboarding" className="underline">
          {t("kyc")}
        </Link>
      </div>

      <ConfirmDialog
        open={confirm === "online"}
        title={t("confirmGoOnline")}
        body={t("confirmGoOnlineBody")}
        confirmLabel={t("goOnline")}
        cancelLabel={t("stayOffline")}
        onConfirm={() => void go("ONLINE")}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === "offline"}
        title={t("confirmOffline")}
        body={t("confirmOfflineBody")}
        confirmLabel={t("goOffline")}
        cancelLabel={t("stayOnline")}
        danger
        onConfirm={() => void go("OFFLINE")}
        onCancel={() => setConfirm(null)}
      />
      {confirm === "decline" && home.offer ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-fg/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-xl bg-card p-5">
            <h2 className="font-display text-xl">{t("declineConfirm")}</h2>
            <Label className="mt-3 block">{t("declineReason")}</Label>
            <Input className="mt-1" value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} />
            <div className="mt-4 flex flex-col gap-2">
              <Button variant="destructive" onClick={() => void respond("DECLINE", home.offer!)}>
                {t("decline")}
              </Button>
              <Button variant="outline" onClick={() => setConfirm(null)}>
                {t("cancel")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted px-2 py-3">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-display text-lg tabular-nums">{value}</dd>
    </div>
  );
}

function StatusPill({
  status,
  online,
  offline,
  busy,
}: {
  status: string;
  online: string;
  offline: string;
  busy: string;
}) {
  const tone = status === "ONLINE" ? "online" : status === "BUSY" ? "busy" : "offline";
  const label = status === "ONLINE" ? online : status === "BUSY" ? busy : offline;
  return <Badge tone={tone}>{label}</Badge>;
}

function formatDuration(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}:${String(m).padStart(2, "0")}`;
}

function OfferCard({
  offer,
  remaining,
  pending,
  onAccept,
  onDecline,
}: {
  offer: DispatchOffer;
  remaining: number;
  pending: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const { t } = useI18n();
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{t("offers")}</p>
          <CardTitle className="mt-1">{offer.restaurant.name}</CardTitle>
          <CardMeta>
            {offer.restaurant.area} → {offer.dropArea}
          </CardMeta>
        </div>
        <Badge tone="sim">{t("simulated")}</Badge>
      </div>
      <p className="mt-3 flex items-center gap-2 font-display text-2xl tabular-nums">
        <Clock3 className="size-5" />
        {remaining}s
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-muted-foreground">{t("expectedPayout")}</dt>
          <dd className="tabular-nums">{formatPaise(offer.expectedPayoutPaise)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("distance")}</dt>
          <dd className="tabular-nums">{offer.approxDistanceKm.toFixed(1)} km</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("route")}</dt>
          <dd className="tabular-nums">{offer.estimatedTotalRouteKm.toFixed(1)} km</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("packages")}</dt>
          <dd>{offer.packageCount}</dd>
        </div>
      </dl>
      {offer.cod ? (
        <p className="mt-3">
          <Badge tone="cod">
            {t("cod")} {formatPaise(offer.codAmountPaise)}
          </Badge>
        </p>
      ) : null}
      {offer.restaurant.specialPickupInstructions ? (
        <p className="mt-3 text-sm text-muted-foreground">{offer.restaurant.specialPickupInstructions}</p>
      ) : null}
      <p className="mt-2 text-xs text-muted-foreground">
        {t("estimated")} · {offer.restaurant.preparationStatus}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button size="lg" disabled={pending} onClick={onAccept}>
          {t("accept")}
        </Button>
        <Button size="lg" variant="outline" disabled={pending} onClick={onDecline}>
          {t("decline")}
        </Button>
      </div>
    </Card>
  );
}
