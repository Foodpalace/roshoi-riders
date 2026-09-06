import { haversineKm } from "./eta.ts";
import { nid, orderCode } from "./ids.ts";
import { simulatedCustomer, simulatedRestaurant } from "./catalog.ts";
import { isEligibleRider } from "./dispatch.ts";
import { assertPlausiblePing } from "./gps.ts";
import { assertNotSelfVerify, assertRiderKycSubmit } from "./kyc.ts";
import { assertTransition, isActiveDelivery } from "./machine.ts";
import { assertNonNegativePaise } from "./money.ts";
import { generateOtp, isPlausibleOtp, newOtpSecret, verifyOtpHash } from "./otp.ts";
import { minimizeCustomer, offerCustomerView } from "./privacy.ts";
import type { RiderStore } from "./store.ts";
import {
  RiderError,
  type Actor,
  type AvailabilityStatus,
  type Delivery,
  type DeliveryState,
  type DispatchOffer,
  type EarningLine,
  type GeoPoint,
  type KycStatus,
  type LocaleCode,
  type PickupVerification,
  type PlatformConfig,
  type PodMethod,
  type RiderDocumentKind,
  type RiderProfile,
  type RiderType,
  type SafetyKind,
  type TicketTopic,
  type VehicleType,
} from "./types.ts";

export type SessionUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
};

const CANCEL_REASONS = [
  "vehicle problem",
  "safety issue",
  "wrong assignment",
  "restaurant issue",
  "customer issue",
  "other",
] as const;

const FAIL_REASONS = [
  "customer unavailable",
  "address not found",
  "refused delivery",
  "unsafe to complete",
  "other",
] as const;

const PROFILE_KEYS = [
  "fullName",
  "phone",
  "email",
  "photoUrl",
  "address",
  "emergencyName",
  "emergencyPhone",
  "dateOfBirth",
  "governmentIdType",
  "governmentIdLast4",
  "riderType",
  "vehicleType",
  "vehicleRegistration",
  "licenceNumber",
  "insuranceRef",
  "payoutUpi",
  "payoutBankLast4",
  "preferredZones",
  "availabilityNotes",
  "locale",
] as const;

type ProfilePatch = Partial<Pick<RiderProfile, (typeof PROFILE_KEYS)[number]>>;

export class RiderEngine {
  private store: RiderStore;
  constructor(store: RiderStore) {
    this.store = store;
  }

  private async cfg(): Promise<PlatformConfig> {
    return this.store.getConfig();
  }

  private now(): string {
    return new Date().toISOString();
  }

  private async audit(actorId: string, action: string, resource: string, resourceId: string, meta = "") {
    await this.store.appendAudit({
      id: nid(),
      actorId,
      action,
      resource,
      resourceId,
      at: this.now(),
      meta,
    });
  }

  private async requireRider(userId: string): Promise<RiderProfile> {
    const r = await this.store.getRiderByUserId(userId);
    if (!r) throw new RiderError("NO_PROFILE", "Complete onboarding first", 400);
    return r;
  }

  private async requireOwnedDelivery(userId: string, deliveryId: string): Promise<Delivery> {
    const d = await this.store.getDeliveryById(deliveryId);
    if (!d) throw new RiderError("NOT_FOUND", "Delivery not found", 404);
    if (d.userId !== userId) {
      throw new RiderError("FORBIDDEN", "You cannot access another rider's delivery", 403);
    }
    return d;
  }

  private async idem<T>(
    userId: string,
    key: string | undefined,
    action: string,
    run: () => Promise<T>,
  ): Promise<T> {
    if (!key || !String(key).trim()) {
      throw new RiderError("IDEMPOTENCY_REQUIRED", "This action needs an idempotency key", 400);
    }
    const existing = await this.store.getIdempotency(userId, key);
    if (existing) return JSON.parse(existing.responseJson) as T;
    const value = await run();
    await this.store.saveIdempotency({
      userId,
      key,
      action,
      resourceId: (value as { id?: string })?.id ?? "",
      responseJson: JSON.stringify(value),
      createdAt: this.now(),
    });
    return value;
  }

  async getPublicConfig() {
    const c = await this.cfg();
    return {
      branding: c.branding,
      flags: c.flags,
      offerTimeoutSeconds: c.offerTimeoutSeconds,
      locationUpdateIntervalSeconds: c.locationUpdateIntervalSeconds,
      supportedLocales: c.supportedLocales,
      defaultLocale: c.defaultLocale,
      dataMode: c.dataMode,
      supportPhone: c.supportPhone,
      emergencyPhone: c.emergencyPhone,
      volunteerEnabled: c.volunteerEnabled,
      payoutFrequency: c.payoutFrequency,
      pickupVerification: c.pickupVerification,
      podMethods: c.podMethods,
    };
  }

  async ensureRider(user: SessionUser): Promise<RiderProfile> {
    const existing = await this.store.getRiderByUserId(user.id);
    if (existing) return existing;
    const now = this.now();
    const rider: RiderProfile = {
      id: nid(),
      userId: user.id,
      fullName: user.name ?? "",
      phone: "",
      email: user.email ?? "",
      photoUrl: user.image ?? null,
      address: "",
      emergencyName: "",
      emergencyPhone: "",
      dateOfBirth: null,
      governmentIdType: null,
      governmentIdLast4: null,
      kycStatus: "DRAFT",
      kycRejectReason: null,
      riderType: "DELIVERY_PARTNER",
      vehicleType: "MOTORCYCLE",
      vehicleRegistration: null,
      licenceNumber: null,
      insuranceRef: null,
      payoutUpi: null,
      payoutBankLast4: null,
      preferredZones: [],
      availabilityNotes: "",
      status: "OFFLINE",
      onlineSince: null,
      locale: "en",
      createdAt: now,
      updatedAt: now,
      dataMode: "SIMULATED",
    };
    await this.store.upsertRider(rider);
    await this.audit(user.id, "RIDER_CREATED", "rider", rider.id);
    return rider;
  }

  async saveProfile(userId: string, patch: ProfilePatch | Record<string, unknown>): Promise<RiderProfile> {
    const rider = await this.requireRider(userId);
    const cfg = await this.cfg();
    const incoming = patch as Record<string, unknown>;
    if ("kycStatus" in incoming && incoming.kycStatus != null) {
      assertNotSelfVerify(incoming.kycStatus as KycStatus);
    }
    const clean: ProfilePatch = {};
    for (const key of PROFILE_KEYS) {
      if (key in incoming && incoming[key] !== undefined) {
        (clean as Record<string, unknown>)[key] = incoming[key];
      }
    }
    if (clean.riderType === "VOLUNTEER" && !cfg.volunteerEnabled) {
      throw new RiderError("FLAG_OFF", "Volunteer type is not enabled", 400);
    }
    const allowedTypes: RiderType[] = ["DELIVERY_PARTNER", "PART_TIME", "FULL_TIME"];
    if (cfg.volunteerEnabled) allowedTypes.push("VOLUNTEER");
    if (clean.riderType && !allowedTypes.includes(clean.riderType)) {
      throw new RiderError("INVALID", "Unknown rider type", 400);
    }
    const next: RiderProfile = {
      ...rider,
      ...clean,
      userId: rider.userId,
      id: rider.id,
      kycStatus: rider.kycStatus,
      status: rider.status,
      onlineSince: rider.onlineSince,
      dataMode: rider.dataMode,
      createdAt: rider.createdAt,
      updatedAt: this.now(),
    };
    if (rider.kycStatus === "VERIFIED" && this.kycFieldsChanged(rider, next)) {
      next.kycStatus = "UNDER_REVIEW";
    }
    await this.store.upsertRider(next);
    return next;
  }

  private kycFieldsChanged(a: RiderProfile, b: RiderProfile): boolean {
    return (
      a.fullName !== b.fullName ||
      a.governmentIdLast4 !== b.governmentIdLast4 ||
      a.vehicleRegistration !== b.vehicleRegistration ||
      a.licenceNumber !== b.licenceNumber
    );
  }

  async submitKyc(userId: string): Promise<RiderProfile> {
    const rider = await this.requireRider(userId);
    assertRiderKycSubmit(rider.kycStatus);
    if (!rider.fullName.trim() || !rider.phone.trim()) {
      throw new RiderError("INCOMPLETE", "Name and phone are required", 400);
    }
    if (!rider.payoutUpi?.trim()) {
      throw new RiderError("INCOMPLETE", "UPI payout details are required", 400);
    }
    const next: RiderProfile = {
      ...rider,
      kycStatus: "SUBMITTED",
      kycRejectReason: null,
      updatedAt: this.now(),
    };
    await this.store.upsertRider(next);
    await this.audit(userId, "KYC_SUBMITTED", "rider", rider.id);
    await this.store.insertNotification({
      id: nid(),
      userId,
      title: "Verification submitted",
      body: "Your documents are under review. You are not fully approved yet.",
      kind: "ACCOUNT",
      read: false,
      createdAt: this.now(),
    });
    return next;
  }

  /** Admin / Window 4 only. Never exposed on rider server functions. */
  async systemSetKyc(
    actor: "ADMIN" | "SYSTEM",
    targetUserId: string,
    status: KycStatus,
    reason?: string | null,
  ): Promise<RiderProfile> {
    if (actor !== "ADMIN" && actor !== "SYSTEM") {
      throw new RiderError("FORBIDDEN", "Only operations can change verification status", 403);
    }
    if (status !== "UNDER_REVIEW" && status !== "VERIFIED" && status !== "REJECTED" && status !== "SUSPENDED") {
      throw new RiderError("INVALID", "Unsupported verification status", 400);
    }
    const rider = await this.requireRider(targetUserId);
    const next: RiderProfile = {
      ...rider,
      kycStatus: status,
      kycRejectReason: status === "REJECTED" ? reason ?? "Rejected" : null,
      updatedAt: this.now(),
    };
    await this.store.upsertRider(next);
    await this.audit(actor, "KYC_ADMIN", "rider", rider.id, status);
    return next;
  }

  async addDocument(
    userId: string,
    input: { kind: RiderDocumentKind; contentType: string; bytes: number; dataUrl?: string },
  ) {
    const rider = await this.requireRider(userId);
    if (!/^image\/(jpeg|png|webp)$/.test(input.contentType) && input.contentType !== "application/pdf") {
      throw new RiderError("FILE_TYPE", "Document must be jpeg, png, webp, or pdf", 400);
    }
    if (input.bytes > 500_000) {
      throw new RiderError("FILE_SIZE", "Document is too large", 400);
    }
    const doc = {
      id: nid(),
      riderId: rider.id,
      kind: input.kind,
      contentType: input.contentType,
      byteSize: input.bytes,
      dataUrl: input.dataUrl ?? null,
      status: "SUBMITTED" as const,
      createdAt: this.now(),
    };
    await this.store.insertDocument(doc, userId);
    await this.audit(userId, "KYC_DOCUMENT", "document", doc.id, input.kind);
    return { id: doc.id, kind: doc.kind, status: doc.status, createdAt: doc.createdAt };
  }

  async documents(userId: string) {
    await this.requireRider(userId);
    return this.store.listDocuments(userId);
  }

  async setStatus(
    userId: string,
    status: AvailabilityStatus,
    confirmed: boolean,
  ): Promise<RiderProfile> {
    if (!confirmed) throw new RiderError("CONFIRM_REQUIRED", "Confirm this status change", 400);
    const rider = await this.requireRider(userId);
    const cfg = await this.cfg();
    if (status === "ONLINE" && cfg.dataMode === "LIVE" && rider.kycStatus !== "VERIFIED") {
      throw new RiderError("KYC", "Unverified partners cannot go online for live orders", 403);
    }
    const active = await this.store.getActiveDeliveryForRider(rider.id);
    if (status === "OFFLINE" && active) {
      throw new RiderError("BUSY", "Finish the current delivery before going offline", 400);
    }
    if (status === "ONLINE" && active) {
      status = "BUSY";
    }
    const next: RiderProfile = {
      ...rider,
      status,
      onlineSince: status === "OFFLINE" ? null : rider.onlineSince ?? this.now(),
      updatedAt: this.now(),
    };
    await this.store.upsertRider(next);
    await this.audit(userId, "STATUS", "rider", rider.id, status);
    if (status === "ONLINE") {
      await this.maybeDispatch(rider.id, userId);
    }
    return next;
  }

  async tick(userId: string) {
    const rider = await this.store.getRiderByUserId(userId);
    if (!rider) return { rider: null as RiderProfile | null, offer: null as DispatchOffer | null };
    await this.expireOffers(rider);
    if (rider.status === "ONLINE") {
      await this.maybeDispatch(rider.id, userId);
    }
    const offer = await this.store.getOpenOfferForRider(rider.id);
    return { rider, offer: offer ? this.presentOffer(offer) : null };
  }

  private async expireOffers(rider: RiderProfile) {
    const offer = await this.store.getOpenOfferForRider(rider.id);
    if (!offer) return;
    if (new Date(offer.expiresAt).getTime() <= Date.now()) {
      await this.store.casOffer(offer.id, rider.id, "EXPIRED");
      await this.audit(rider.userId, "OFFER_EXPIRED", "offer", offer.id);
    }
  }

  private async maybeDispatch(riderId: string, userId: string) {
    const cfg = await this.cfg();
    const rider = await this.store.getRiderById(riderId);
    if (!rider) return;
    const active = await this.store.getActiveDeliveryForRider(riderId);
    const open = await this.store.getOpenOfferForRider(riderId);
    const last = await this.store.latestLocation(userId);
    if (
      !isEligibleRider({
        rider: {
          riderId: rider.id,
          userId: rider.userId,
          status: rider.status,
          kycStatus: rider.kycStatus,
          preferredZones: [],
          lastPoint: last?.point ?? null,
        },
        dataMode: cfg.dataMode,
        hasActiveDelivery: Boolean(active),
        hasOpenOffer: Boolean(open),
        pickup: simulatedRestaurant().location,
        restaurantArea: "",
        maxRadiusKm: cfg.maxDeliveryRadiusKm,
      })
    ) {
      return;
    }
    const restaurant = simulatedRestaurant();
    const customer = simulatedCustomer();
    const pickup = restaurant.location;
    const drop = customer.location;
    const km = Math.round(haversineKm(pickup, drop) * 100) / 100;
    const travel = Math.round(km * cfg.travelFactor * 100) / 100;
    const now = Date.now();
    const payout = 3500 + Math.round(km * 800);
    assertNonNegativePaise(payout);
    const cod = cfg.flags.cod && Math.random() < 0.45;
    const offer: DispatchOffer = {
      id: nid(),
      riderId,
      orderCode: orderCode(),
      restaurant,
      customer: customer.slice,
      pickupLocation: pickup,
      dropArea: customer.slice.area,
      dropLocation: drop,
      approxDistanceKm: km,
      estimatedTravelKm: travel,
      estimatedTotalRouteKm: travel + 0.4,
      expectedPayoutPaise: payout,
      cod,
      codAmountPaise: cod ? 12000 + Math.round(Math.random() * 18000) : 0,
      packageCount: 1 + (Math.random() < 0.2 ? 1 : 0),
      expiresAt: new Date(now + cfg.offerTimeoutSeconds * 1000).toISOString(),
      status: "OPEN",
      createdAt: new Date(now).toISOString(),
      dataMode: "SIMULATED",
    };
    await this.store.insertOffer(offer, userId);
    await this.store.insertNotification({
      id: nid(),
      userId,
      title: "New delivery offer",
      body: `${restaurant.name} · ${customer.slice.area}`,
      kind: "OFFER",
      read: false,
      createdAt: this.now(),
    });
  }

  presentOffer(offer: DispatchOffer): DispatchOffer {
    return {
      ...offer,
      customer: offerCustomerView(offer.customer),
    };
  }

  async respondOffer(
    userId: string,
    offerId: string,
    decision: "ACCEPT" | "DECLINE",
    reason: string | undefined,
    idempotencyKey: string,
  ) {
    return this.idem(userId, idempotencyKey, "offer.respond", async () => {
      const rider = await this.requireRider(userId);
      const offer = await this.store.getOfferById(offerId);
      if (!offer) throw new RiderError("NOT_FOUND", "Offer not found", 404);
      const owner = await this.store.getRiderById(offer.riderId);
      if (!owner || owner.userId !== userId) {
        throw new RiderError("FORBIDDEN", "You cannot respond to another rider's offer", 403);
      }
      if (offer.status !== "OPEN") {
        throw new RiderError("OFFER_GONE", "This offer is no longer available", 409);
      }
      if (new Date(offer.expiresAt).getTime() <= Date.now()) {
        await this.store.casOffer(offer.id, rider.id, "EXPIRED");
        throw new RiderError("OFFER_EXPIRED", "This offer has expired", 409);
      }
      if (decision === "DECLINE") {
        const claimed = await this.store.casOffer(offer.id, rider.id, "DECLINED");
        if (!claimed) throw new RiderError("OFFER_GONE", "This offer is no longer available", 409);
        await this.audit(userId, "OFFER_DECLINED", "offer", offer.id, reason ?? "");
        return { decision, delivery: null as Delivery | null, offer: { ...offer, status: "DECLINED" as const } };
      }
      const existing = await this.store.getActiveDeliveryForRider(rider.id);
      if (existing) {
        throw new RiderError("BUSY", "You already have an active delivery", 409);
      }
      const claimed = await this.store.casOffer(offer.id, rider.id, "ACCEPTED");
      if (!claimed) {
        throw new RiderError("OFFER_GONE", "This offer is no longer available", 409);
      }
      const delivery = await this.createDeliveryFromOffer(rider, { ...offer, status: "ACCEPTED" });
      const busy: RiderProfile = { ...rider, status: "BUSY", updatedAt: this.now() };
      await this.store.upsertRider(busy);
      return { decision, delivery, offer: { ...offer, status: "ACCEPTED" as const } };
    });
  }

  private async createDeliveryFromOffer(rider: RiderProfile, offer: DispatchOffer): Promise<Delivery> {
    const cfg = await this.cfg();
    const now = this.now();
    const delivery: Delivery = {
      id: nid(),
      offerId: offer.id,
      riderId: rider.id,
      userId: rider.userId,
      orderCode: offer.orderCode,
      orderId: nid(),
      state: "ACCEPTED",
      restaurant: offer.restaurant,
      customer: offer.customer,
      pickupLocation: offer.pickupLocation,
      dropLocation: offer.dropLocation,
      packageCount: offer.packageCount,
      expectedPayoutPaise: offer.expectedPayoutPaise,
      cod: offer.cod,
      codAmountPaise: offer.codAmountPaise,
      pickupVerification: cfg.pickupVerification,
      pickupCode: String(1000 + Math.floor(Math.random() * 9000)),
      otpRequired: cfg.flags.delivery_otp,
      arrivedRestaurantAt: null,
      expectedReadyAt: null,
      pickedUpAt: null,
      arrivedCustomerAt: null,
      deliveredAt: null,
      waitStartedAt: null,
      contactAttempts: 0,
      cancelReason: null,
      failReason: null,
      createdAt: now,
      updatedAt: now,
      dataMode: "SIMULATED",
    };
    await this.store.insertDelivery(delivery);
    await this.recordTransition(delivery, null, "ACCEPTED", "RIDER", rider.userId, "accepted offer");
    if (cfg.flags.delivery_otp) {
      const otp = generateOtp(4);
      const secret = newOtpSecret(otp);
      await this.store.saveOtp(
        {
          deliveryId: delivery.id,
          hash: secret.hash,
          salt: secret.salt,
          attempts: 0,
          verifiedAt: null,
          simulatedPlain: otp,
        },
        rider.userId,
      );
    }
    if (offer.cod && cfg.flags.cod) {
      await this.store.saveCash(
        {
          deliveryId: delivery.id,
          riderId: rider.id,
          expectedPaise: offer.codAmountPaise,
          collectedPaise: null,
          state: "EXPECTED",
          exceptionReason: null,
          updatedAt: now,
        },
        rider.userId,
      );
    }
    return this.presentDelivery(delivery);
  }

  presentDelivery(d: Delivery): Delivery {
    return { ...d, customer: minimizeCustomer(d.customer, d.state) };
  }

  async getDelivery(userId: string, deliveryId: string): Promise<Delivery> {
    const d = await this.requireOwnedDelivery(userId, deliveryId);
    return this.presentDelivery(d);
  }

  async getDeliveryBundle(userId: string, deliveryId: string) {
    const delivery = await this.getDelivery(userId, deliveryId);
    const simulatedOtp = await this.otpForSimulation(userId, deliveryId);
    const cash = await this.store.getCash(deliveryId);
    return { delivery, simulatedOtp, cash };
  }

  async getActiveDelivery(userId: string): Promise<Delivery | null> {
    const rider = await this.requireRider(userId);
    const d = await this.store.getActiveDeliveryForRider(rider.id);
    return d ? this.presentDelivery(d) : null;
  }

  private async transition(
    userId: string,
    deliveryId: string,
    to: DeliveryState,
    reason: string | null,
    extra?: (d: Delivery) => void,
  ): Promise<Delivery> {
    const d = await this.requireOwnedDelivery(userId, deliveryId);
    if (d.state === "ORDER_CANCELLED") {
      throw new RiderError("ORDER_CANCELLED", "This order was cancelled. Do not deliver it.", 409);
    }
    assertTransition(d.state, to);
    const prev = d.state;
    extra?.(d);
    d.state = to;
    d.updatedAt = this.now();
    await this.store.updateDelivery(d);
    await this.recordTransition(d, prev, to, "RIDER", userId, reason);
    if (to === "DELIVERED" || to === "RIDER_CANCELLED" || to === "DELIVERY_FAILED") {
      const rider = await this.requireRider(userId);
      const still = await this.store.getActiveDeliveryForRider(rider.id);
      if (!still && rider.status === "BUSY") {
        await this.store.upsertRider({
          ...rider,
          status: "ONLINE",
          updatedAt: this.now(),
        });
      }
    }
    return this.presentDelivery(d);
  }

  private async recordTransition(
    d: Delivery,
    prev: DeliveryState | null,
    next: DeliveryState,
    actor: Actor,
    actorId: string,
    reason: string | null,
  ) {
    await this.store.insertEvent(
      {
        id: nid(),
        deliveryId: d.id,
        previousState: prev,
        newState: next,
        actor,
        actorId,
        reason,
        at: this.now(),
      },
      d.userId,
    );
  }

  async arriving(userId: string, deliveryId: string, key: string) {
    return this.idem(userId, key, "arrive.going", () =>
      this.transition(userId, deliveryId, "ARRIVING_AT_RESTAURANT", null),
    );
  }

  async arriveRestaurant(userId: string, deliveryId: string, key: string) {
    return this.idem(userId, key, "arrive.restaurant", () =>
      this.transition(userId, deliveryId, "ARRIVED_AT_RESTAURANT", null, (d) => {
        d.arrivedRestaurantAt = this.now();
      }),
    );
  }

  async restaurantNotReady(userId: string, deliveryId: string, expectedReadyAt: string | null) {
    return this.transition(userId, deliveryId, "RESTAURANT_NOT_READY", "restaurant not ready", (d) => {
      d.expectedReadyAt = expectedReadyAt;
    });
  }

  async pickup(
    userId: string,
    deliveryId: string,
    verification: { method: PickupVerification; code?: string },
    key: string,
  ) {
    return this.idem(userId, key, "pickup", async () => {
      const d = await this.requireOwnedDelivery(userId, deliveryId);
      if (d.state !== "ARRIVED_AT_RESTAURANT" && d.state !== "RESTAURANT_NOT_READY") {
        throw new RiderError("INVALID_STATE", "Pickup is not allowed in this state", 409);
      }
      if (d.pickedUpAt) {
        return this.presentDelivery(d);
      }
      const cfg = await this.cfg();
      if (cfg.pickupVerification === "ORDER_CODE" || cfg.pickupVerification === "PIN") {
        if (!verification.code || verification.code.trim() !== d.pickupCode) {
          throw new RiderError("PICKUP_CODE", "Pickup code does not match", 400);
        }
      }
      return this.transition(userId, deliveryId, "PICKED_UP", "picked up", (row) => {
        row.pickedUpAt = this.now();
      });
    });
  }

  async startDelivery(userId: string, deliveryId: string, key: string) {
    return this.idem(userId, key, "start", () => this.transition(userId, deliveryId, "ON_THE_WAY", null));
  }

  async arriveCustomer(userId: string, deliveryId: string, key: string) {
    return this.idem(userId, key, "arrive.customer", () =>
      this.transition(userId, deliveryId, "ARRIVED_AT_CUSTOMER", null, (d) => {
        d.arrivedCustomerAt = this.now();
      }),
    );
  }

  async collectCash(userId: string, deliveryId: string, key: string, attemptedPaise?: number) {
    return this.idem(userId, key, "cash", async () => {
      const d = await this.requireOwnedDelivery(userId, deliveryId);
      const cash = await this.store.getCash(deliveryId);
      if (!d.cod || !cash) throw new RiderError("NOT_COD", "This order is not cash on delivery", 400);
      if (cash.state === "COLLECTED" || cash.state === "RECONCILED") return cash;
      if (d.state !== "ARRIVED_AT_CUSTOMER" && d.state !== "SUPPORT_ESCALATION") {
        throw new RiderError("INVALID_STATE", "Collect cash only at the customer", 409);
      }
      if (attemptedPaise != null && attemptedPaise !== cash.expectedPaise) {
        throw new RiderError("CASH_IMMUTABLE", "The cash amount is locked on the order", 400);
      }
      cash.collectedPaise = cash.expectedPaise;
      cash.state = "COLLECTED";
      cash.updatedAt = this.now();
      await this.store.saveCash(cash, userId);
      await this.audit(userId, "CASH_COLLECTED", "cash", deliveryId, String(cash.expectedPaise));
      return cash;
    });
  }

  async deliver(
    userId: string,
    deliveryId: string,
    otp: string | undefined,
    key: string,
  ) {
    return this.idem(userId, key, "deliver", async () => {
      const cfg = await this.cfg();
      const d = await this.requireOwnedDelivery(userId, deliveryId);
      if (d.state === "DELIVERED") return this.presentDelivery(d);
      if (d.state === "ORDER_CANCELLED") {
        throw new RiderError("ORDER_CANCELLED", "This order was cancelled. Do not deliver it.", 409);
      }
      if (d.state !== "ARRIVED_AT_CUSTOMER" && d.state !== "SUPPORT_ESCALATION") {
        throw new RiderError("INVALID_STATE", "Arrive at the customer before completing delivery", 409);
      }
      if (d.cod) {
        const cash = await this.store.getCash(deliveryId);
        if (!cash || cash.state === "EXPECTED") {
          throw new RiderError("CASH_REQUIRED", "Collect cash before completing this delivery", 400);
        }
      }
      if (cfg.flags.delivery_otp && d.otpRequired) {
        if (!otp || !isPlausibleOtp(otp)) {
          throw new RiderError("OTP_REQUIRED", "Enter the customer OTP to complete delivery", 400);
        }
        const limited = await this.store.hitRateLimit(userId, `otp:${deliveryId}`, 60_000, cfg.otpMaxAttempts);
        if (limited) {
          throw new RiderError("OTP_LOCKED", "Too many attempts. Support has been notified.", 429);
        }
        const rec = await this.store.getOtp(deliveryId);
        if (!rec) throw new RiderError("OTP_MISSING", "OTP is not available for this delivery", 500);
        if (rec.verifiedAt) {
          /* already verified — continue */
        } else {
          const ok = verifyOtpHash(otp, rec.salt, rec.hash);
          rec.attempts += 1;
          if (!ok) {
            await this.store.saveOtp(rec, userId);
            if (rec.attempts >= cfg.otpSuspiciousThreshold) {
              await this.store.insertSignal(
                {
                  id: nid(),
                  riderId: d.riderId,
                  deliveryId: d.id,
                  kind: "REPEATED_FAILED_OTP",
                  detail: `${rec.attempts} failed attempts`,
                  stage: "SIGNAL",
                  createdAt: this.now(),
                },
                userId,
              );
            }
            if (rec.attempts >= cfg.otpMaxAttempts) {
              throw new RiderError("OTP_LOCKED", "Too many attempts. Support has been notified.", 429);
            }
            throw new RiderError("OTP_WRONG", "That code does not match. Try again.", 400);
          }
          rec.verifiedAt = this.now();
          await this.store.saveOtp(rec, userId);
        }
      }
      const delivered = await this.transition(userId, deliveryId, "DELIVERED", "otp verified", (row) => {
        row.deliveredAt = this.now();
      });
      await this.creditEarnings(d);
      return delivered;
    });
  }

  private async creditEarnings(d: Delivery) {
    const existing = await this.store.listEarnings(d.userId);
    if (existing.some((e) => e.deliveryId === d.id && e.kind === "DELIVERY_PAYOUT")) return;
    const cfg = await this.cfg();
    const lines: EarningLine[] = [
      {
        id: nid(),
        riderId: d.riderId,
        deliveryId: d.id,
        orderCode: d.orderCode,
        kind: "DELIVERY_PAYOUT",
        amountPaise: d.expectedPayoutPaise,
        note: "Delivery payout",
        at: this.now(),
        dataMode: "SIMULATED",
      },
    ];
    if (cfg.flags.incentives && d.packageCount > 1) {
      lines.push({
        id: nid(),
        riderId: d.riderId,
        deliveryId: d.id,
        orderCode: d.orderCode,
        kind: "INCENTIVE",
        amountPaise: 500,
        note: "Multi-package",
        at: this.now(),
        dataMode: "SIMULATED",
      });
    }
    for (const line of lines) await this.store.appendEarning(line, d.userId);
  }

  async addPod(
    userId: string,
    deliveryId: string,
    input: { method: PodMethod; contentType?: string; dataUrl?: string; bytes?: number },
  ) {
    const cfg = await this.cfg();
    const d = await this.requireOwnedDelivery(userId, deliveryId);
    if (input.method === "PHOTO") {
      if (!cfg.flags.pod_photo) throw new RiderError("FLAG_OFF", "Photo proof is not enabled", 400);
      if (!input.contentType || !/^image\/(jpeg|png|webp)$/.test(input.contentType)) {
        throw new RiderError("FILE_TYPE", "Photo must be jpeg, png, or webp", 400);
      }
      if ((input.bytes ?? 0) > cfg.podMaxBytes) {
        throw new RiderError("FILE_SIZE", "Photo is too large", 400);
      }
    }
    const pod = {
      id: nid(),
      deliveryId: d.id,
      riderId: d.riderId,
      method: input.method,
      photoContentType: input.contentType ?? null,
      photoBytes: input.bytes ?? null,
      photoDataUrl: input.dataUrl ?? null,
      capturedAt: this.now(),
      dataMode: "SIMULATED" as const,
    };
    await this.store.insertPod(pod, userId);
    return { id: pod.id, method: pod.method, capturedAt: pod.capturedAt };
  }

  async customerUnavailable(userId: string, deliveryId: string) {
    return this.transition(userId, deliveryId, "CUSTOMER_UNAVAILABLE", "customer not available", (d) => {
      d.waitStartedAt = d.waitStartedAt ?? this.now();
    });
  }

  async contactAttempt(userId: string, deliveryId: string) {
    const d = await this.requireOwnedDelivery(userId, deliveryId);
    d.contactAttempts += 1;
    d.updatedAt = this.now();
    await this.store.updateDelivery(d);
    await this.audit(userId, "CONTACT_ATTEMPT", "delivery", d.id, String(d.contactAttempts));
    return this.presentDelivery(d);
  }

  async cancelDelivery(userId: string, deliveryId: string, reason: string, confirmed: boolean, key: string) {
    if (!confirmed) throw new RiderError("CONFIRM_REQUIRED", "Confirm cancellation", 400);
    const normalized = reason.trim().toLowerCase();
    if (!CANCEL_REASONS.includes(normalized as (typeof CANCEL_REASONS)[number])) {
      throw new RiderError("REASON_REQUIRED", "Choose a valid cancellation reason", 400);
    }
    return this.idem(userId, key, "cancel", () =>
      this.transition(userId, deliveryId, "RIDER_CANCELLED", normalized, (d) => {
        d.cancelReason = normalized;
      }),
    );
  }

  async failDelivery(userId: string, deliveryId: string, reason: string, confirmed: boolean, key: string) {
    if (!confirmed) throw new RiderError("CONFIRM_REQUIRED", "Confirm failed delivery", 400);
    const normalized = reason.trim().toLowerCase();
    if (!FAIL_REASONS.includes(normalized as (typeof FAIL_REASONS)[number])) {
      throw new RiderError("REASON_REQUIRED", "Choose a valid failure reason", 400);
    }
    return this.idem(userId, key, "fail", () =>
      this.transition(userId, deliveryId, "DELIVERY_FAILED", normalized, (d) => {
        d.failReason = normalized;
      }),
    );
  }

  async escalate(userId: string, deliveryId: string, key: string) {
    return this.idem(userId, key, "escalate", () =>
      this.transition(userId, deliveryId, "SUPPORT_ESCALATION", "rider escalated"),
    );
  }

  async adminCancelOrder(userId: string, deliveryId: string) {
    const d = await this.requireOwnedDelivery(userId, deliveryId);
    if (d.state === "DELIVERED") {
      throw new RiderError("ALREADY_DELIVERED", "Cannot cancel a delivered order", 409);
    }
    if (d.state === "ORDER_CANCELLED") return this.presentDelivery(d);
    const prev = d.state;
    d.state = "ORDER_CANCELLED";
    d.updatedAt = this.now();
    await this.store.updateDelivery(d);
    await this.recordTransition(d, prev, "ORDER_CANCELLED", "SYSTEM", userId, "order cancelled");
    return this.presentDelivery(d);
  }

  async postLocation(
    userId: string,
    point: GeoPoint,
    accuracyM: number | null,
    deliveryId: string | null,
  ) {
    const rider = await this.requireRider(userId);
    const cfg = await this.cfg();
    if (!cfg.flags.live_tracking) {
      throw new RiderError("FLAG_OFF", "Live tracking is off", 400);
    }
    const active = await this.store.getActiveDeliveryForRider(rider.id);
    const onDuty = rider.status === "ONLINE" || rider.status === "BUSY" || Boolean(active);
    if (!onDuty) {
      throw new RiderError("NOT_TRACKING", "Location is only used while online or on a delivery", 400);
    }
    if (deliveryId) {
      const d = await this.requireOwnedDelivery(userId, deliveryId);
      if (!isActiveDelivery(d.state)) {
        throw new RiderError("NOT_TRACKING", "Location is only used while online or on a delivery", 400);
      }
    }
    const at = this.now();
    const previous = await this.store.latestLocation(userId);
    try {
      assertPlausiblePing(previous, point, at);
    } catch (err) {
      if (err instanceof RiderError && err.code === "FAKE_GPS") {
        await this.store.insertSignal(
          {
            id: nid(),
            riderId: rider.id,
            deliveryId,
            kind: "FAKE_GPS",
            detail: `${point.lat},${point.lng}`,
            stage: "SIGNAL",
            createdAt: at,
          },
          userId,
        );
      }
      throw err;
    }
    const ping = {
      id: nid(),
      riderId: rider.id,
      deliveryId,
      point,
      accuracyM,
      at,
    };
    await this.store.insertLocation(ping, userId);
    const keepAfter = new Date(Date.now() - cfg.locationRetentionHours * 3600_000).toISOString();
    await this.store.pruneLocations(userId, keepAfter, cfg.gpsHistoryMaxPings);
    return { ok: true as const, at: ping.at };
  }

  async home(userId: string) {
    const rider = await this.requireRider(userId);
    await this.expireOffers(rider);
    if (rider.status === "ONLINE") await this.maybeDispatch(rider.id, userId);
    const offerRaw = await this.store.getOpenOfferForRider(rider.id);
    const offer =
      offerRaw && new Date(offerRaw.expiresAt).getTime() > Date.now()
        ? this.presentOffer(offerRaw)
        : null;
    const active = await this.store.getActiveDeliveryForRider(rider.id);
    const today = todayRange();
    const earnings = await this.store.listEarnings(userId, today);
    const deliveries = await this.store.listDeliveriesForUser(userId, today);
    const completed = deliveries.filter((d) => d.state === "DELIVERED").length;
    const cashRows = [];
    for (const d of deliveries) {
      const c = await this.store.getCash(d.id);
      if (c) cashRows.push(c);
    }
    const pendingCash = cashRows
      .filter((c) => c.state === "COLLECTED")
      .reduce((a, c) => a + (c.collectedPaise ?? 0), 0);
    const notifications = await this.store.listNotifications(userId);
    const otp = active ? await this.store.getOtp(active.id) : null;
    const cash = active ? await this.store.getCash(active.id) : null;
    return {
      rider,
      offer,
      active: active ? this.presentDelivery(active) : null,
      todayEarningsPaise: earnings.reduce((a, e) => a + e.amountPaise, 0),
      completedToday: completed,
      pendingCashPaise: pendingCash,
      onlineSince: rider.onlineSince,
      notifications: notifications.slice(0, 8),
      simulatedOtp: otp?.simulatedPlain ?? null,
      cash,
      dataMode: (await this.cfg()).dataMode,
    };
  }

  async earnings(userId: string, range: { from: string; to: string }) {
    await this.requireRider(userId);
    const lines = await this.store.listEarnings(userId, range);
    const cashDeliveries = await this.store.listDeliveriesForUser(userId, range);
    let collected = 0;
    let reconciled = 0;
    for (const d of cashDeliveries) {
      const c = await this.store.getCash(d.id);
      if (!c) continue;
      if (c.collectedPaise) collected += c.collectedPaise;
      if (c.state === "RECONCILED") reconciled += c.collectedPaise ?? 0;
    }
    const net = lines.reduce((a, e) => a + e.amountPaise, 0);
    return {
      lines,
      totals: {
        payout: sumKind(lines, "DELIVERY_PAYOUT"),
        incentive: sumKind(lines, "INCENTIVE"),
        adjustment: sumKind(lines, "ADJUSTMENT"),
        deduction: sumKind(lines, "DEDUCTION"),
        net,
        cashCollected: collected,
        cashReconciled: reconciled,
        netPayable: net,
      },
      dataMode: "SIMULATED" as const,
    };
  }

  async settlements(userId: string) {
    const rider = await this.requireRider(userId);
    let rows = await this.store.listSettlements(userId);
    if (rows.length === 0) {
      const lines = await this.store.listEarnings(userId);
      const net = lines.reduce((a, e) => a + e.amountPaise, 0);
      const s = {
        id: nid(),
        riderId: rider.id,
        periodStart: new Date().toISOString().slice(0, 10),
        periodEnd: new Date().toISOString().slice(0, 10),
        amountPaise: net,
        status: "PAYABLE" as const,
        confirmedPaidAt: null,
        dataMode: "SIMULATED" as const,
      };
      await this.store.insertSettlement(s, userId);
      rows = [s];
    }
    return rows;
  }

  async history(userId: string, range: { from: string; to: string }) {
    await this.requireRider(userId);
    const deliveries = await this.store.listDeliveriesForUser(userId, range);
    const earnings = await this.store.listEarnings(userId, range);
    return deliveries.map((d) => {
      const related = earnings.filter((e) => e.deliveryId === d.id);
      return {
        delivery: this.presentDelivery(d),
        payout: sumKind(related, "DELIVERY_PAYOUT"),
        incentive: sumKind(related, "INCENTIVE"),
        adjustment: sumKind(related, "ADJUSTMENT"),
      };
    });
  }

  async performance(userId: string) {
    await this.requireRider(userId);
    const all = await this.store.listDeliveriesForUser(userId);
    const completed = all.filter((d) => d.state === "DELIVERED").length;
    const cancelled = all.filter((d) => d.state === "RIDER_CANCELLED").length;
    const accepted = all.filter((d) => d.state !== "RIDER_DECLINED" && d.state !== "OFFER_EXPIRED").length;
    const earnings = await this.store.listEarnings(userId);
    const net = earnings.reduce((a, e) => a + e.amountPaise, 0);
    return {
      completed,
      offered: accepted + cancelled,
      accepted,
      cancelled,
      onTimePickup: completed,
      successfulDelivery: completed,
      earningsPerOrderPaise: completed ? Math.round(net / completed) : 0,
    };
  }

  async createTicket(
    userId: string,
    input: { topic: TicketTopic; message: string; deliveryId?: string | null },
    key: string,
  ) {
    return this.idem(userId, key, "ticket", async () => {
      const rider = await this.requireRider(userId);
      if (input.deliveryId) await this.requireOwnedDelivery(userId, input.deliveryId);
      const ticket = {
        id: nid(),
        riderId: rider.id,
        deliveryId: input.deliveryId ?? null,
        topic: input.topic,
        message: input.message.trim(),
        status: "OPEN" as const,
        createdAt: this.now(),
        updatedAt: this.now(),
      };
      if (!ticket.message) throw new RiderError("INVALID", "Message is required", 400);
      await this.store.insertTicket(ticket, userId);
      return ticket;
    });
  }

  async tickets(userId: string) {
    await this.requireRider(userId);
    return this.store.listTickets(userId);
  }

  async safety(
    userId: string,
    input: { kind: SafetyKind; note: string; deliveryId?: string | null; location?: GeoPoint | null },
  ) {
    const rider = await this.requireRider(userId);
    const incident = {
      id: nid(),
      riderId: rider.id,
      deliveryId: input.deliveryId ?? null,
      kind: input.kind,
      note: input.note,
      location: input.location ?? null,
      createdAt: this.now(),
      emergencyDispatched: false as const,
    };
    await this.store.insertSafety(incident, userId);
    return incident;
  }

  async notifications(userId: string) {
    await this.requireRider(userId);
    return this.store.listNotifications(userId);
  }

  async setLocale(userId: string, locale: LocaleCode) {
    return this.saveProfile(userId, { locale });
  }

  async otpForSimulation(userId: string, deliveryId: string) {
    const d = await this.requireOwnedDelivery(userId, deliveryId);
    const rec = await this.store.getOtp(d.id);
    return rec?.simulatedPlain ?? null;
  }

  async snapshotForAssistant(userId: string) {
    const home = await this.home(userId);
    const range = todayRange();
    const earnings = await this.earnings(userId, range);
    const history = await this.history(userId, range);
    return {
      dataMode: "SIMULATED" as const,
      riderName: home.rider.fullName,
      status: home.rider.status,
      kycStatus: home.rider.kycStatus,
      todayEarningsPaise: earnings.totals.net,
      completedToday: home.completedToday,
      currentDelivery: home.active
        ? {
            orderCode: home.active.orderCode,
            state: home.active.state,
            restaurant: home.active.restaurant.name,
            dropArea: home.active.customer.area,
          }
        : null,
      history: history.map((h) => ({
        orderCode: h.delivery.orderCode,
        state: h.delivery.state,
        payoutPaise: h.payout,
      })),
      payoutTotals: earnings.totals,
    };
  }

  async forbiddenEarningsProbe(actorUserId: string, otherUserId: string) {
    if (actorUserId === otherUserId) return this.earnings(actorUserId, todayRange());
    throw new RiderError("FORBIDDEN", "You cannot access another rider's earnings", 403);
  }
}

function sumKind(lines: EarningLine[], kind: EarningLine["kind"]): number {
  return lines.filter((l) => l.kind === kind).reduce((a, l) => a + l.amountPaise, 0);
}

export function todayRange(now = new Date()): { from: string; to: string } {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return { from: start.toISOString(), to: end.toISOString() };
}

export function rangePreset(
  preset: "today" | "yesterday" | "week" | "month",
  now = new Date(),
): { from: string; to: string } {
  if (preset === "today") return todayRange(now);
  if (preset === "yesterday") {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    return todayRange(d);
  }
  if (preset === "week") {
    const from = new Date(now);
    from.setDate(from.getDate() - 6);
    from.setHours(0, 0, 0, 0);
    return { from: from.toISOString(), to: now.toISOString() };
  }
  const from = new Date(now);
  from.setDate(1);
  from.setHours(0, 0, 0, 0);
  return { from: from.toISOString(), to: now.toISOString() };
}

export function mapsUrl(point: GeoPoint, label: string): string {
  const q = encodeURIComponent(`${point.lat},${point.lng} (${label})`);
  return `https://www.openstreetmap.org/?mlat=${point.lat}&mlon=${point.lng}#map=16/${point.lat}/${point.lng}&q=${q}`;
}

export function geoUrl(point: GeoPoint): string {
  return `geo:${point.lat},${point.lng}`;
}
