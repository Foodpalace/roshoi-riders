/**
 * Window 5 dispatch contract.
 *
 * Window 3 never self-assigns and never invents a live marketplace.
 * Simulated adapter: restaurant READY → in-memory queue → one eligible
 * ONLINE rider → OPEN offer → exclusive CAS accept → pickup → delivery.
 *
 * Live Window 5 must replace SimulatedDispatch with a shared-core adapter
 * that talks to the same shapes.
 */

import { haversineKm } from "./eta.ts";
import type {
  AvailabilityStatus,
  CustomerSlice,
  DataMode,
  DispatchOffer,
  GeoPoint,
  KycStatus,
  RestaurantSlice,
} from "./types.ts";

export const DISPATCH_FLOW = [
  "RESTAURANT_READY",
  "DISPATCH_QUEUE",
  "ELIGIBLE_RIDERS",
  "OFFER",
  "ACCEPT_EXCLUSIVE",
  "PICKUP",
  "DELIVERY",
] as const;

export type DispatchStep = (typeof DISPATCH_FLOW)[number];

export type DispatchJobStatus =
  | "QUEUED"
  | "OFFERING"
  | "ASSIGNED"
  | "EXPIRED"
  | "CANCELLED";

export type ReadyOrderEvent = {
  type: "RESTAURANT_READY";
  orderId: string;
  orderCode: string;
  restaurant: RestaurantSlice;
  customer: CustomerSlice;
  pickupLocation: GeoPoint;
  dropLocation: GeoPoint;
  dropArea: string;
  packageCount: number;
  cod: boolean;
  codAmountPaise: number;
  expectedPayoutPaise: number;
  readyAt: string;
};

export type EligibleRider = {
  riderId: string;
  userId: string;
  status: AvailabilityStatus;
  kycStatus: KycStatus;
  preferredZones: string[];
  lastPoint: GeoPoint | null;
};

export type EligibilityInput = {
  rider: EligibleRider;
  dataMode: DataMode;
  hasActiveDelivery: boolean;
  hasOpenOffer: boolean;
  pickup: GeoPoint;
  restaurantArea: string;
  maxRadiusKm: number;
};

/**
 * Eligibility is server-side. Riders cannot opt into an order they were
 * not offered. LIVE duty requires VERIFIED KYC. One active job in the pilot
 * (`multi_order` off).
 */
export function isEligibleRider(input: EligibilityInput): boolean {
  if (input.rider.status !== "ONLINE") return false;
  if (input.hasActiveDelivery) return false;
  if (input.hasOpenOffer) return false;
  if (input.dataMode === "LIVE" && input.rider.kycStatus !== "VERIFIED") return false;
  if (input.rider.preferredZones.length > 0) {
    const zoneOk = input.rider.preferredZones.some(
      (z) => z.toLowerCase() === input.restaurantArea.toLowerCase(),
    );
    if (!zoneOk) return false;
  }
  if (input.rider.lastPoint) {
    const km = haversineKm(input.rider.lastPoint, input.pickup);
    if (km > input.maxRadiusKm) return false;
  }
  return true;
}

export type DispatchPort = {
  enqueueReady(event: ReadyOrderEvent): Promise<{ jobId: string }>;
  findEligibleRiders(jobId: string): Promise<EligibleRider[]>;
  offerToRider(
    jobId: string,
    riderId: string,
    timeoutSeconds: number,
  ): Promise<DispatchOffer>;
  /** CAS: OPEN + unexpired + matching rider → ACCEPTED. Second writer loses. */
  exclusiveAccept(offerId: string, riderId: string): Promise<boolean>;
};

export const WINDOW5_REQUIREMENTS = {
  eventsIn: ["RESTAURANT_READY", "ORDER_CANCELLED", "READY_DELAYED"] as const,
  eventsOut: [
    "RIDER_ASSIGNED",
    "RIDER_ARRIVING",
    "RIDER_ARRIVED",
    "PICKED_UP",
    "ON_THE_WAY",
    "ARRIVING",
    "DELIVERED",
    "DELIVERY_FAILED",
    "RIDER_CANCELLED",
  ] as const,
  accept: "UPDATE dispatch_offers SET status='ACCEPTED' WHERE id=$1 AND rider_id=$2 AND status='OPEN' AND expires_at > now() RETURNING *",
  money: "integer paise; earnings append-only; COD expected_paise immutable",
  location: "pings only while ONLINE/BUSY or active delivery; reject impossible jumps",
  otp: "hash+salt server-side; rate-limited; never client-verified",
  kyc: "VERIFIED/REJECTED/SUSPENDED are admin actions",
  adapters: {
    simulated: "Window 3 SimulatedDispatch — labelled SIMULATED",
    live: "Window 5 shared core — not implemented here",
  },
} as const;
