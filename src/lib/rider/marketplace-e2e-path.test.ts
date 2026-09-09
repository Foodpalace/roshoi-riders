import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toMarketplaceOrderStatus } from "./order-status-bridge.ts";
import { SimulatedDispatch } from "./simulated-dispatch.ts";

/**
 * Pure path test: customer ladder + partner restaurant steps + rider delivery
 * collapse to the same marketplace vocabulary (no DB).
 */
describe("marketplace e2e status path", () => {
  it("customer happy path statuses chain", () => {
    const path = [
      "PLACED",
      "ACCEPTED",
      "PREPARING",
      "READY",
      "RIDER_ASSIGNED",
      "PICKED_UP",
      "ON_THE_WAY",
      "DELIVERED",
    ];
    assert.equal(path[0], "PLACED");
    assert.equal(path.at(-1), "DELIVERED");
  });

  it("partner READY job becomes rider offer → RIDER_ASSIGNED", async () => {
    const d = new SimulatedDispatch("SIMULATED");
    const { jobId } = await d.enqueuePartnerRow({
      orderId: "ord_e2e",
      restaurantId: "rst_e2e",
      orderNumber: "E2E-1",
      orderCode: "E2E1",
      pickupLat: 24.87,
      pickupLng: 92.35,
      pickupAddress: "Court Road",
      readyAt: new Date().toISOString(),
      status: "queued",
      dataLabel: "SIMULATED",
      restaurantName: "E2E Kitchen",
      restaurantArea: "Court Road",
    });
    const offer = await d.offerToRider(jobId, "rider_e2e", 90);
    await d.exclusiveAccept(offer.id, "rider_e2e");
    assert.equal(toMarketplaceOrderStatus("ACCEPTED"), "RIDER_ASSIGNED");
    assert.equal(d.getJob(jobId)?.event.restaurant.preparationStatus, "READY");
  });

  it("rider delivery ladder maps onto customer track", () => {
    const deliveryPath = [
      "OFFERED",
      "ACCEPTED",
      "ARRIVING_AT_RESTAURANT",
      "ARRIVED_AT_RESTAURANT",
      "PICKED_UP",
      "ON_THE_WAY",
      "ARRIVED_AT_CUSTOMER",
      "DELIVERED",
    ] as const;
    const mapped = deliveryPath.map((s) => toMarketplaceOrderStatus(s));
    assert.deepEqual(
      [...new Set(mapped)],
      ["READY", "RIDER_ASSIGNED", "PICKED_UP", "ON_THE_WAY", "DELIVERED"],
    );
  });
});
