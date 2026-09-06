import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardMeta } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { compressImage, errorMessage, newIdempotencyKey } from "@/lib/client/errors";
import { formatPaise } from "@/lib/rider/money";
import { useI18n } from "@/lib/rider/i18n-context";
import { deliveryActionFn } from "@/lib/server/rider-fns";
import type { CashReconciliation, Delivery } from "@/lib/rider/types";
import { useState } from "react";
import { ConfirmDialog } from "./confirm-dialog";

export function DeliveryActions({
  delivery,
  cash,
  simulatedOtp,
  onChanged,
}: {
  delivery: Delivery;
  cash: CashReconciliation | null;
  simulatedOtp: string | null;
  onChanged: () => void;
}) {
  const { t } = useI18n();
  const [code, setCode] = useState("");
  const [otp, setOtp] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState("vehicle problem");

  async function act(
    action:
      | "ARRIVING"
      | "ARRIVE_RESTAURANT"
      | "NOT_READY"
      | "PICKUP"
      | "START"
      | "ARRIVE_CUSTOMER"
      | "COLLECT_CASH"
      | "DELIVER"
      | "UNAVAILABLE"
      | "CONTACT"
      | "CANCEL",
    extra: Record<string, unknown> = {},
  ) {
    setPending(true);
    setError(null);
    try {
      await deliveryActionFn({
        data: {
          deliveryId: delivery.id,
          action,
          idempotencyKey: newIdempotencyKey(),
          ...extra,
        } as never,
      });
      onChanged();
    } catch (e) {
      setError(errorMessage(e, t("actionNotConfirmed")));
    } finally {
      setPending(false);
    }
  }

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    setPending(true);
    try {
      const compressed = await compressImage(file, 180_000);
      await deliveryActionFn({
        data: {
          deliveryId: delivery.id,
          action: "POD",
          idempotencyKey: newIdempotencyKey(),
          pod: {
            method: "PHOTO",
            contentType: compressed.contentType,
            dataUrl: compressed.dataUrl,
            bytes: compressed.bytes,
          },
        },
      });
      onChanged();
    } catch (e) {
      setError(errorMessage(e, t("actionNotConfirmed")));
    } finally {
      setPending(false);
    }
  }

  const d = delivery;
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium">
          {t("order")} {d.orderCode}
        </p>
        <Badge tone="sim">{t("simulated")}</Badge>
      </div>
      <p className="text-sm">
        {d.restaurant.name} · {d.packageCount} {t("packages")}
      </p>
      <p className="text-sm text-muted-foreground">{d.customer.area}</p>
      {d.customer.address ? <p className="text-sm">{d.customer.address}</p> : null}
      {d.customer.instructions ? <p className="text-sm">{d.customer.instructions}</p> : null}
      {d.customer.contactAllowed && d.customer.contactMasked ? (
        <p className="text-sm text-muted-foreground">{d.customer.contactMasked}</p>
      ) : null}
      {d.cod ? (
        <p>
          <Badge tone="cod">
            {t("collectCash")} {formatPaise(d.codAmountPaise)}
          </Badge>
        </p>
      ) : null}
      {error ? <p className="text-sm text-offline">{error}</p> : null}

      {d.state === "ACCEPTED" ? (
        <Button size="lg" className="w-full" disabled={pending} onClick={() => void act("ARRIVING")}>
          {t("navigate")} — {d.restaurant.name}
        </Button>
      ) : null}
      {d.state === "ARRIVING_AT_RESTAURANT" ? (
        <Button size="lg" className="w-full" disabled={pending} onClick={() => void act("ARRIVE_RESTAURANT")}>
          {t("imAtRestaurant")}
        </Button>
      ) : null}
      {d.state === "ARRIVED_AT_RESTAURANT" || d.state === "RESTAURANT_NOT_READY" ? (
        <div className="space-y-3">
          <p className="text-sm">
            {t("pickupCode")}: <span className="font-mono tabular-nums">{d.pickupCode}</span>
          </p>
          <Label>{t("pickupCode")}</Label>
          <Input inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} />
          <Button
            size="lg"
            className="w-full"
            disabled={pending}
            onClick={() => void act("PICKUP", { pickupCode: code })}
          >
            {t("pickUp")}
          </Button>
          {d.state === "ARRIVED_AT_RESTAURANT" ? (
            <Button
              variant="outline"
              className="w-full"
              disabled={pending}
              onClick={() => void act("NOT_READY")}
            >
              {t("restaurantNotReady")}
            </Button>
          ) : (
            <CardMeta>{t("waitingRestaurant")}</CardMeta>
          )}
        </div>
      ) : null}
      {d.state === "PICKED_UP" ? (
        <Button size="lg" className="w-full" disabled={pending} onClick={() => void act("START")}>
          {t("startDelivery")}
        </Button>
      ) : null}
      {d.state === "ON_THE_WAY" ? (
        <div className="space-y-2">
          <Button size="lg" className="w-full" disabled={pending} onClick={() => void act("ARRIVE_CUSTOMER")}>
            {t("iveArrived")}
          </Button>
          <Button variant="outline" className="w-full" disabled={pending} onClick={() => void act("UNAVAILABLE")}>
            {t("customerUnavailable")}
          </Button>
        </div>
      ) : null}
      {d.state === "ARRIVED_AT_CUSTOMER" || d.state === "SUPPORT_ESCALATION" ? (
        <div className="space-y-3">
          {d.cod && cash && cash.state === "EXPECTED" ? (
            <div>
              <p className="text-sm text-muted-foreground">{t("cashMustMatch")}</p>
              <Button size="lg" className="mt-2 w-full" disabled={pending} onClick={() => void act("COLLECT_CASH")}>
                {t("cashCollected")} {formatPaise(cash.expectedPaise)}
              </Button>
            </div>
          ) : null}
          {simulatedOtp ? (
            <p className="rounded-md bg-muted px-3 py-2 text-sm">
              {t("simOtpHint")} <span className="font-mono tabular-nums">{simulatedOtp}</span>
            </p>
          ) : null}
          <Label>{t("enterOtp")}</Label>
          <Input inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(e) => setOtp(e.target.value)} />
          <Label className="block">{t("photoPod")}</Label>
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => void onPhoto(e.target.files?.[0])}
          />
          <Button size="lg" className="w-full" disabled={pending} onClick={() => void act("DELIVER", { otp })}>
            {t("confirmDelivered")}
          </Button>
        </div>
      ) : null}
      {d.state === "CUSTOMER_UNAVAILABLE" ? (
        <div className="space-y-2">
          <CardMeta>
            {t("waitTimer")} · {t("contactAttempt")} ({d.contactAttempts})
          </CardMeta>
          <Button className="w-full" disabled={pending} onClick={() => void act("CONTACT")}>
            {t("contactAttempt")}
          </Button>
        </div>
      ) : null}

      {d.state !== "DELIVERED" && d.state !== "RIDER_CANCELLED" && d.state !== "ORDER_CANCELLED" ? (
        <Button variant="ghost" className="w-full text-offline" onClick={() => setCancelOpen(true)}>
          {t("cancelDelivery")}
        </Button>
      ) : null}

      {cancelOpen ? (
        <div className="space-y-2 rounded-lg bg-muted p-3">
          <Label>{t("cancelReason")}</Label>
          <select
            className="h-11 w-full rounded-md border border-border bg-surface px-3"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            <option value="vehicle problem">{t("vehicleProblem")}</option>
            <option value="safety issue">{t("safetyIssue")}</option>
            <option value="wrong assignment">{t("wrongAssignment")}</option>
            <option value="restaurant issue">{t("restaurantIssue")}</option>
            <option value="customer issue">{t("customerIssue")}</option>
            <option value="other">{t("other")}</option>
          </select>
          <ConfirmDialog
            open
            title={t("cancelDelivery")}
            body={t("cancelReason")}
            confirmLabel={t("confirm")}
            cancelLabel={t("cancel")}
            danger
            onCancel={() => setCancelOpen(false)}
            onConfirm={() => {
              setCancelOpen(false);
              void act("CANCEL", { reason, confirmed: true });
            }}
          />
        </div>
      ) : null}
    </Card>
  );
}
