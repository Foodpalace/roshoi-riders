import type { DeliveryState } from "./types.ts";

/** Marketplace order statuses shared with customer + partner apps. */
export type MarketplaceOrderStatus =
  | "PLACED"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "RIDER_ASSIGNED"
  | "PICKED_UP"
  | "ON_THE_WAY"
  | "DELIVERED"
  | "CANCELLED"
  | "DELIVERY_FAILED";

/**
 * Map rider delivery lifecycle → marketplace order status.
 * Rider states are finer-grained; collapse to the customer-visible ladder.
 */
export function toMarketplaceOrderStatus(
  delivery: DeliveryState,
): MarketplaceOrderStatus | null {
  switch (delivery) {
    case "OFFERED":
      return "READY";
    case "ACCEPTED":
    case "ARRIVING_AT_RESTAURANT":
    case "ARRIVED_AT_RESTAURANT":
    case "RESTAURANT_NOT_READY":
      return "RIDER_ASSIGNED";
    case "PICKED_UP":
      return "PICKED_UP";
    case "ON_THE_WAY":
    case "ARRIVED_AT_CUSTOMER":
      return "ON_THE_WAY";
    case "DELIVERED":
      return "DELIVERED";
    case "RIDER_DECLINED":
    case "OFFER_EXPIRED":
      return "READY";
    case "RIDER_CANCELLED":
    case "ORDER_CANCELLED":
      return "CANCELLED";
    case "CUSTOMER_UNAVAILABLE":
    case "DELIVERY_FAILED":
      return "DELIVERY_FAILED";
    case "SUPPORT_ESCALATION":
      return "ON_THE_WAY";
    default:
      return null;
  }
}

export function isActiveMarketplaceStatus(status: MarketplaceOrderStatus): boolean {
  return (
    status === "RIDER_ASSIGNED" ||
    status === "PICKED_UP" ||
    status === "ON_THE_WAY" ||
    status === "READY"
  );
}
