/**
 * In-memory SimulatedDispatch for SIMULATED data mode.
 * Consumes partner `rider_dispatch_queue`-shaped READY jobs and produces
 * exclusive OPEN offers for eligible ONLINE riders.
 */

import { haversineKm } from "./eta.ts";
import { isEligibleRider, type DispatchPort, type EligibleRider, type ReadyOrderEvent } from "./dispatch.ts";
import type {
  DataMode,
  DispatchOffer,
  GeoPoint,
  RestaurantSlice,
  CustomerSlice,
} from "./types.ts";

export type PartnerQueueRow = {
  orderId: string;
  restaurantId: string;
  orderNumber: string;
  orderCode: string;
  pickupLat: number | null;
  pickupLng: number | null;
  pickupAddress: string;
  pickupInstructions?: string | null;
  readyAt: string;
  status: string;
  dataLabel: string;
  restaurantName?: string;
  restaurantArea?: string;
  dropLat?: number | null;
  dropLng?: number | null;
  dropArea?: string;
  dropAddress?: string;
  customerDisplayName?: string;
  cod?: boolean;
  codAmountPaise?: number;
  expectedPayoutPaise?: number;
  packageCount?: number;
};

export type DispatchJob = {
  jobId: string;
  status: "QUEUED" | "OFFERING" | "ASSIGNED" | "EXPIRED" | "CANCELLED";
  event: ReadyOrderEvent;
  offeredToRiderId: string | null;
  offerId: string | null;
};

function nid(): string {
  return `job_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function partnerQueueRowToReadyEvent(row: PartnerQueueRow): ReadyOrderEvent {
  const pickup: GeoPoint = {
    lat: row.pickupLat ?? 24.869,
    lng: row.pickupLng ?? 92.355,
  };
  const drop: GeoPoint = {
    lat: row.dropLat ?? pickup.lat + 0.008,
    lng: row.dropLng ?? pickup.lng - 0.006,
  };
  const restaurant: RestaurantSlice = {
    id: row.restaurantId,
    name: row.restaurantName ?? "Partner kitchen",
    area: row.restaurantArea ?? "Local",
    address: row.pickupAddress || "Pickup",
    location: pickup,
    phoneMasked: "•••• 0000",
    specialPickupInstructions: row.pickupInstructions ?? null,
    preparationStatus: "READY",
  };
  const customer: CustomerSlice = {
    displayName: row.customerDisplayName ?? "Customer",
    area: row.dropArea ?? "Delivery area",
    address: row.dropAddress ?? null,
    contactMasked: null,
    contactAllowed: false,
    instructions: null,
  };
  const km = haversineKm(pickup, drop);
  const payout = row.expectedPayoutPaise ?? 3500 + Math.round(km * 800);
  return {
    type: "RESTAURANT_READY",
    orderId: row.orderId,
    orderCode: row.orderCode || row.orderNumber.slice(-4),
    restaurant,
    customer,
    pickupLocation: pickup,
    dropLocation: drop,
    dropArea: customer.area,
    packageCount: row.packageCount ?? 1,
    cod: Boolean(row.cod),
    codAmountPaise: row.codAmountPaise ?? 0,
    expectedPayoutPaise: payout,
    readyAt: row.readyAt,
  };
}

export class SimulatedDispatch implements DispatchPort {
  private jobs = new Map<string, DispatchJob>();
  private offers = new Map<string, DispatchOffer>();
  private dataMode: DataMode;

  constructor(dataMode: DataMode = "SIMULATED") {
    this.dataMode = dataMode;
  }

  async enqueueReady(event: ReadyOrderEvent): Promise<{ jobId: string }> {
    const jobId = nid();
    this.jobs.set(jobId, {
      jobId,
      status: "QUEUED",
      event,
      offeredToRiderId: null,
      offerId: null,
    });
    return { jobId };
  }

  /** Partner queue adapter: enqueue from rider_dispatch_queue row shape. */
  async enqueuePartnerRow(row: PartnerQueueRow): Promise<{ jobId: string }> {
    if (row.dataLabel !== "SIMULATED" && this.dataMode === "SIMULATED") {
      // Still allow enqueue in pure tests; engine must gate LIVE separately.
    }
    if (row.status !== "queued" && row.status !== "QUEUED") {
      throw new Error(`Dispatch row not queued: ${row.status}`);
    }
    return this.enqueueReady(partnerQueueRowToReadyEvent(row));
  }

  async findEligibleRiders(_jobId: string): Promise<EligibleRider[]> {
    return [];
  }

  async offerToRider(
    jobId: string,
    riderId: string,
    timeoutSeconds: number,
  ): Promise<DispatchOffer> {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error("Job not found");
    if (job.status !== "QUEUED" && job.status !== "OFFERING") {
      throw new Error(`Job not offerable: ${job.status}`);
    }
    const ev = job.event;
    const km = Math.round(haversineKm(ev.pickupLocation, ev.dropLocation) * 100) / 100;
    const now = Date.now();
    const offer: DispatchOffer = {
      id: `off_${Math.random().toString(36).slice(2, 12)}`,
      riderId,
      orderCode: ev.orderCode,
      restaurant: { ...ev.restaurant, preparationStatus: "READY" },
      customer: ev.customer,
      pickupLocation: ev.pickupLocation,
      dropArea: ev.dropArea,
      dropLocation: ev.dropLocation,
      approxDistanceKm: km,
      estimatedTravelKm: km,
      estimatedTotalRouteKm: km + 0.4,
      expectedPayoutPaise: ev.expectedPayoutPaise,
      cod: ev.cod,
      codAmountPaise: ev.codAmountPaise,
      packageCount: ev.packageCount,
      expiresAt: new Date(now + timeoutSeconds * 1000).toISOString(),
      status: "OPEN",
      createdAt: new Date(now).toISOString(),
      dataMode: this.dataMode,
    };
    this.offers.set(offer.id, offer);
    job.status = "OFFERING";
    job.offeredToRiderId = riderId;
    job.offerId = offer.id;
    return offer;
  }

  async exclusiveAccept(offerId: string, riderId: string): Promise<boolean> {
    const offer = this.offers.get(offerId);
    if (!offer) return false;
    if (offer.riderId !== riderId) return false;
    if (offer.status !== "OPEN") return false;
    if (new Date(offer.expiresAt).getTime() <= Date.now()) {
      offer.status = "EXPIRED";
      return false;
    }
    offer.status = "ACCEPTED";
    for (const job of this.jobs.values()) {
      if (job.offerId === offerId) job.status = "ASSIGNED";
    }
    return true;
  }

  getJob(jobId: string): DispatchJob | undefined {
    return this.jobs.get(jobId);
  }

  getOffer(offerId: string): DispatchOffer | undefined {
    return this.offers.get(offerId);
  }

  listQueued(): DispatchJob[] {
    return [...this.jobs.values()].filter((j) => j.status === "QUEUED");
  }
}

/** Pure helper: should this rider receive an offer for a READY job? */
export function canOfferJobToRider(input: {
  rider: EligibleRider;
  dataMode: DataMode;
  hasActiveDelivery: boolean;
  hasOpenOffer: boolean;
  pickup: GeoPoint;
  restaurantArea: string;
  maxRadiusKm: number;
}): boolean {
  return isEligibleRider(input);
}
