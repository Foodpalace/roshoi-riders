/**
 * Versioned integration contracts for Windows 1, 2, 4 and 5.
 * These are the shapes Window 3 expects. Adapters in this app currently
 * speak SIMULATED data that matches the same schemas.
 */

export const API_VERSION = "v1";

export const RIDER_ROUTES = {
  status: "POST /v1/rider/status",
  profile: "GET /v1/rider/profile",
  offers: "GET /v1/rider/offers",
  respond: "POST /v1/rider/offers/:id/respond",
  deliveries: "GET /v1/rider/deliveries",
  arrive: "POST /v1/rider/deliveries/:id/arrive",
  pickup: "POST /v1/rider/deliveries/:id/pickup",
  location: "POST /v1/rider/deliveries/:id/location",
  deliver: "POST /v1/rider/deliveries/:id/deliver",
  pod: "POST /v1/rider/deliveries/:id/pod",
  earnings: "GET /v1/rider/earnings",
  settlements: "GET /v1/rider/settlements",
  support: "POST /v1/rider/support",
  safety: "POST /v1/rider/safety",
} as const;

export type Window1Events =
  | "RIDER_ASSIGNED"
  | "PICKED_UP"
  | "ON_THE_WAY"
  | "ARRIVING"
  | "DELIVERED";

export type Window2Events =
  | "READY"
  | "RIDER_ASSIGNED"
  | "RIDER_ARRIVING"
  | "RIDER_ARRIVED"
  | "PICKED_UP";

export type IdempotentPost = {
  idempotencyKey: string;
};
