import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { RiderEngine, rangePreset } from "@/lib/rider/engine";
import { PgStore } from "@/lib/rider/pg-store";
import {
  RiderError,
  type AvailabilityStatus,
  type LocaleCode,
  type RiderProfile,
} from "@/lib/rider/types";

async function engine() {
  const sql = await getSql();
  return new RiderEngine(new PgStore(sql));
}

function fail(e: unknown): never {
  if (e instanceof RiderError) throw e;
  throw e;
}

export const getPublicConfigFn = createServerFn({ method: "GET" }).handler(async () => {
  const e = await engine();
  return e.getPublicConfig();
});

export const bootstrapRiderFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const e = await engine();
      return await e.ensureRider({ id: context.userId });
    } catch (err) {
      fail(err);
    }
  });

export const getHomeFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const e = await engine();
      await e.ensureRider({ id: context.userId });
      return await e.home(context.userId);
    } catch (err) {
      fail(err);
    }
  });

export const saveProfileFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: Partial<RiderProfile>) => input)
  .handler(async ({ context, data }) => {
    try {
      const e = await engine();
      await e.ensureRider({ id: context.userId });
      return await e.saveProfile(context.userId, data);
    } catch (err) {
      fail(err);
    }
  });

export const submitKycFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const e = await engine();
      return await e.submitKyc(context.userId);
    } catch (err) {
      fail(err);
    }
  });

export const setStatusFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { status: AvailabilityStatus; confirmed: boolean }) => input)
  .handler(async ({ context, data }) => {
    try {
      const e = await engine();
      return await e.setStatus(context.userId, data.status, data.confirmed);
    } catch (err) {
      fail(err);
    }
  });

export const respondOfferFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      offerId: string;
      decision: "ACCEPT" | "DECLINE";
      reason?: string;
      idempotencyKey: string;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    try {
      const e = await engine();
      return await e.respondOffer(
        context.userId,
        data.offerId,
        data.decision,
        data.reason,
        data.idempotencyKey,
      );
    } catch (err) {
      fail(err);
    }
  });

export const deliveryActionFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      deliveryId: string;
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
        | "CANCEL"
        | "POD";
      idempotencyKey: string;
      pickupCode?: string;
      otp?: string;
      reason?: string;
      confirmed?: boolean;
      expectedReadyAt?: string;
      pod?: { method: "PHOTO" | "OTP"; contentType?: string; dataUrl?: string; bytes?: number };
    }) => input,
  )
  .handler(async ({ context, data }) => {
    try {
      const e = await engine();
      const id = data.deliveryId;
      const key = data.idempotencyKey;
      switch (data.action) {
        case "ARRIVING":
          return { delivery: await e.arriving(context.userId, id, key) };
        case "ARRIVE_RESTAURANT":
          return { delivery: await e.arriveRestaurant(context.userId, id, key) };
        case "NOT_READY":
          return {
            delivery: await e.restaurantNotReady(context.userId, id, data.expectedReadyAt ?? null),
          };
        case "PICKUP":
          return {
            delivery: await e.pickup(
              context.userId,
              id,
              { method: "ORDER_CODE", code: data.pickupCode },
              key,
            ),
          };
        case "START":
          return { delivery: await e.startDelivery(context.userId, id, key) };
        case "ARRIVE_CUSTOMER":
          return { delivery: await e.arriveCustomer(context.userId, id, key) };
        case "COLLECT_CASH":
          return { cash: await e.collectCash(context.userId, id, key) };
        case "DELIVER":
          return { delivery: await e.deliver(context.userId, id, data.otp, key) };
        case "UNAVAILABLE":
          return { delivery: await e.customerUnavailable(context.userId, id) };
        case "CONTACT":
          return { delivery: await e.contactAttempt(context.userId, id) };
        case "CANCEL":
          return {
            delivery: await e.cancelDelivery(
              context.userId,
              id,
              data.reason ?? "",
              Boolean(data.confirmed),
              key,
            ),
          };
        case "POD":
          if (!data.pod) throw new RiderError("INVALID", "Photo proof is required", 400);
          return { pod: await e.addPod(context.userId, id, data.pod) };
        default:
          throw new RiderError("INVALID", "Unknown action", 400);
      }
    } catch (err) {
      fail(err);
    }
  });

export const postLocationFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: { lat: number; lng: number; accuracyM: number | null; deliveryId: string | null }) =>
      input,
  )
  .handler(async ({ context, data }) => {
    try {
      const e = await engine();
      return await e.postLocation(
        context.userId,
        { lat: data.lat, lng: data.lng },
        data.accuracyM,
        data.deliveryId,
      );
    } catch (err) {
      fail(err);
    }
  });

export const getEarningsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { preset: "today" | "yesterday" | "week" | "month"; from?: string; to?: string }) => input)
  .handler(async ({ context, data }) => {
    try {
      const e = await engine();
      const range =
        data.from && data.to ? { from: data.from, to: data.to } : rangePreset(data.preset);
      return await e.earnings(context.userId, range);
    } catch (err) {
      fail(err);
    }
  });

export const getHistoryFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { preset: "today" | "yesterday" | "week" | "month" }) => input)
  .handler(async ({ context, data }) => {
    try {
      const e = await engine();
      return await e.history(context.userId, rangePreset(data.preset));
    } catch (err) {
      fail(err);
    }
  });

export const getSettlementsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const e = await engine();
      return await e.settlements(context.userId);
    } catch (err) {
      fail(err);
    }
  });

export const getPerformanceFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const e = await engine();
      return await e.performance(context.userId);
    } catch (err) {
      fail(err);
    }
  });

export const createTicketFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      topic:
        | "ORDER_ISSUE"
        | "RESTAURANT_ISSUE"
        | "CUSTOMER_UNAVAILABLE"
        | "CASH_DISPUTE"
        | "PAYMENT_ISSUE"
        | "APP_ISSUE"
        | "VEHICLE_PROBLEM"
        | "SAFETY_ISSUE"
        | "OTHER";
      message: string;
      deliveryId?: string | null;
      idempotencyKey: string;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    try {
      const e = await engine();
      return await e.createTicket(
        context.userId,
        { topic: data.topic, message: data.message, deliveryId: data.deliveryId },
        data.idempotencyKey,
      );
    } catch (err) {
      fail(err);
    }
  });

export const listTicketsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const e = await engine();
      return await e.tickets(context.userId);
    } catch (err) {
      fail(err);
    }
  });

export const reportSafetyFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      kind:
        | "EMERGENCY_CALL"
        | "SHARE_LOCATION"
        | "UNSAFE_SITUATION"
        | "ROAD_BLOCKAGE"
        | "ACCIDENT"
        | "CUSTOMER_ISSUE"
        | "RESTAURANT_ISSUE"
        | "PLATFORM_SUPPORT";
      note: string;
      deliveryId?: string | null;
      lat?: number | null;
      lng?: number | null;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    try {
      const e = await engine();
      return await e.safety(context.userId, {
        kind: data.kind,
        note: data.note,
        deliveryId: data.deliveryId,
        location: data.lat != null && data.lng != null ? { lat: data.lat, lng: data.lng } : null,
      });
    } catch (err) {
      fail(err);
    }
  });

export const listNotificationsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const e = await engine();
      return await e.notifications(context.userId);
    } catch (err) {
      fail(err);
    }
  });

export const setLocaleFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { locale: LocaleCode }) => input)
  .handler(async ({ context, data }) => {
    try {
      const e = await engine();
      await e.ensureRider({ id: context.userId });
      return await e.setLocale(context.userId, data.locale);
    } catch (err) {
      fail(err);
    }
  });

export const getDeliveryFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { deliveryId: string }) => input)
  .handler(async ({ context, data }) => {
    try {
      const e = await engine();
      const delivery = await e.getDelivery(context.userId, data.deliveryId);
      const simulatedOtp = await e.otpForSimulation(context.userId, data.deliveryId);
      return { delivery, simulatedOtp };
    } catch (err) {
      fail(err);
    }
  });

export const assistantSnapshotFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const e = await engine();
      return await e.snapshotForAssistant(context.userId);
    } catch (err) {
      fail(err);
    }
  });
