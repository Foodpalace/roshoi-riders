import type { DeliveryState } from "@/lib/rider/types";

export type CanonicalStatus =
  | "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "RIDER_ASSIGNED" | "PICKED_UP"
  | "ON_THE_WAY" | "ARRIVING" | "DELIVERED" | "CANCELLED" | "PAYMENT_FAILED"
  | "RESTAURANT_REJECTED" | "RIDER_CANCELLED" | "DELIVERY_FAILED" | "CUSTOMER_UNAVAILABLE"
  | "REFUND_PENDING" | "REFUNDED" | "DISPUTED";

type LiveTransition = { from: CanonicalStatus; to: CanonicalStatus; reason?: string };

function config() {
  const url = process.env.HDMASTER_URL?.trim().replace(/\/+$/, "");
  const token = process.env.ROSHOI_SERVICE_TOKEN?.trim();
  if (!url || !token) throw new Error("HDMASTER_URL and ROSHOI_SERVICE_TOKEN are required for LIVE rider operations");
  return { url, token };
}

function mapDeliveryAction(state: DeliveryState, action: string, reason?: string): LiveTransition | null {
  if (action === "ACCEPT") return { from: "READY", to: "RIDER_ASSIGNED" };
  if (action === "PICKUP") return { from: "RIDER_ASSIGNED", to: "PICKED_UP" };
  if (action === "START") return { from: "PICKED_UP", to: "ON_THE_WAY" };
  if (action === "ARRIVE_CUSTOMER") return { from: "ON_THE_WAY", to: "ARRIVING" };
  if (action === "DELIVER") return { from: "ARRIVING", to: "DELIVERED" };
  if (action === "UNAVAILABLE") return { from: "ARRIVING", to: "CUSTOMER_UNAVAILABLE", reason };
  if (action === "CANCEL") return { from: "RIDER_ASSIGNED", to: "RIDER_CANCELLED", reason };
  if (action === "CANCEL_AFTER_PICKUP") return { from: state === "ON_THE_WAY" ? "ON_THE_WAY" : "PICKED_UP", to: "RIDER_CANCELLED", reason };
  return null;
}

export async function transitionLiveOrder(input: {
  orderId: string;
  riderId: string;
  deliveryState: DeliveryState;
  action: string;
  idempotencyKey: string;
  reason?: string;
}) {
  const transition = mapDeliveryAction(input.deliveryState, input.action, input.reason);
  if (!transition) return { skipped: true as const };
  const { url, token } = config();
  const correlationId = `rider:${input.riderId}:${input.orderId}:${input.action}`;
  const response = await fetch(`${url}/v1/admin/orders/${encodeURIComponent(input.orderId)}/rider-transition`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      "Idempotency-Key": input.idempotencyKey,
      "X-Correlation-Id": correlationId,
    },
    body: JSON.stringify({ contractVersion: "1", riderId: input.riderId, from: transition.from, to: transition.to, reason: transition.reason, correlationId }),
  });
  const payload = (await response.json().catch(() => ({}))) as { data?: unknown; error?: string };
  if (!response.ok || !payload.data) throw new Error(payload.error ?? `HDmaster rider transition failed (${response.status})`);
  return payload.data;
}
