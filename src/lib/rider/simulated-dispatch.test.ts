import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canOfferJobToRider,
  partnerQueueRowToReadyEvent,
  SimulatedDispatch,
} from "./simulated-dispatch.ts";
import { toMarketplaceOrderStatus } from "./order-status-bridge.ts";

describe("SimulatedDispatch", () => {
  it("converts partner queue row to READY event", () => {
    const ev = partnerQueueRowToReadyEvent({
      orderId: "ord_1",
      restaurantId: "rst_1",
      orderNumber: "R-1001",
      orderCode: "1001",
      pickupLat: 24.87,
      pickupLng: 92.35,
      pickupAddress: "Station Road",
      readyAt: new Date().toISOString(),
      status: "queued",
      dataLabel: "SIMULATED",
      restaurantName: "Spice House",
      restaurantArea: "Station Road",
      cod: true,
      codAmountPaise: 15000,
    });
    assert.equal(ev.type, "RESTAURANT_READY");
    assert.equal(ev.orderId, "ord_1");
    assert.equal(ev.restaurant.preparationStatus, "READY");
    assert.equal(ev.cod, true);
  });

  it("enqueue → offer → exclusive accept", async () => {
    const d = new SimulatedDispatch("SIMULATED");
    const { jobId } = await d.enqueuePartnerRow({
      orderId: "ord_2",
      restaurantId: "rst_2",
      orderNumber: "R-2002",
      orderCode: "2002",
      pickupLat: 24.87,
      pickupLng: 92.35,
      pickupAddress: "Main Road",
      readyAt: new Date().toISOString(),
      status: "queued",
      dataLabel: "SIMULATED",
    });
    const offer = await d.offerToRider(jobId, "rider_a", 60);
    assert.equal(offer.status, "OPEN");
    assert.equal(offer.riderId, "rider_a");
    const ok = await d.exclusiveAccept(offer.id, "rider_a");
    assert.equal(ok, true);
    assert.equal(d.getOffer(offer.id)?.status, "ACCEPTED");
    assert.equal(d.getJob(jobId)?.status, "ASSIGNED");
    // Second accept loses
    const lose = await d.exclusiveAccept(offer.id, "rider_b");
    assert.equal(lose, false);
  });

  it("eligibility blocks offline and busy riders", () => {
    const pickup = { lat: 24.87, lng: 92.35 };
    assert.equal(
      canOfferJobToRider({
        rider: {
          riderId: "r1",
          userId: "u1",
          status: "OFFLINE",
          kycStatus: "VERIFIED",
          preferredZones: [],
          lastPoint: pickup,
        },
        dataMode: "SIMULATED",
        hasActiveDelivery: false,
        hasOpenOffer: false,
        pickup,
        restaurantArea: "Station Road",
        maxRadiusKm: 12,
      }),
      false,
    );
    assert.equal(
      canOfferJobToRider({
        rider: {
          riderId: "r1",
          userId: "u1",
          status: "ONLINE",
          kycStatus: "DRAFT",
          preferredZones: [],
          lastPoint: pickup,
        },
        dataMode: "SIMULATED",
        hasActiveDelivery: false,
        hasOpenOffer: false,
        pickup,
        restaurantArea: "Station Road",
        maxRadiusKm: 12,
      }),
      true,
    );
  });

  it("accepted delivery maps to RIDER_ASSIGNED marketplace status", () => {
    assert.equal(toMarketplaceOrderStatus("ACCEPTED"), "RIDER_ASSIGNED");
    assert.equal(toMarketplaceOrderStatus("PICKED_UP"), "PICKED_UP");
    assert.equal(toMarketplaceOrderStatus("DELIVERED"), "DELIVERED");
  });
});
