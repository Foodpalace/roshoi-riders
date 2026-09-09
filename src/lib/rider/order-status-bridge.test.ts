import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isActiveMarketplaceStatus,
  toMarketplaceOrderStatus,
} from "./order-status-bridge.ts";

describe("rider order-status-bridge", () => {
  it("maps offer/accept to READY / RIDER_ASSIGNED", () => {
    assert.equal(toMarketplaceOrderStatus("OFFERED"), "READY");
    assert.equal(toMarketplaceOrderStatus("ACCEPTED"), "RIDER_ASSIGNED");
    assert.equal(toMarketplaceOrderStatus("ARRIVED_AT_RESTAURANT"), "RIDER_ASSIGNED");
  });

  it("maps pickup and delivery", () => {
    assert.equal(toMarketplaceOrderStatus("PICKED_UP"), "PICKED_UP");
    assert.equal(toMarketplaceOrderStatus("ON_THE_WAY"), "ON_THE_WAY");
    assert.equal(toMarketplaceOrderStatus("ARRIVED_AT_CUSTOMER"), "ON_THE_WAY");
    assert.equal(toMarketplaceOrderStatus("DELIVERED"), "DELIVERED");
  });

  it("maps failure paths", () => {
    assert.equal(toMarketplaceOrderStatus("ORDER_CANCELLED"), "CANCELLED");
    assert.equal(toMarketplaceOrderStatus("DELIVERY_FAILED"), "DELIVERY_FAILED");
    assert.equal(toMarketplaceOrderStatus("CUSTOMER_UNAVAILABLE"), "DELIVERY_FAILED");
  });

  it("active marketplace flags", () => {
    assert.equal(isActiveMarketplaceStatus("RIDER_ASSIGNED"), true);
    assert.equal(isActiveMarketplaceStatus("DELIVERED"), false);
  });
});
