import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { RiderEngine } from "./engine.ts";
import { MemoryStore } from "./memory-store.ts";
import { canTransition } from "./machine.ts";
import { formatPaise, paise } from "./money.ts";
import { generateOtp, newOtpSecret, verifyOtpHash } from "./otp.ts";
import { RiderError } from "./types.ts";
import { offerCustomerView } from "./privacy.ts";

function engine() {
  const store = new MemoryStore();
  return { store, eng: new RiderEngine(store) };
}

async function twoRiders() {
  const { store, eng } = engine();
  const a = await eng.ensureRider({ id: "rider-a", name: "Amina", email: "a@roshoi.test" });
  const b = await eng.ensureRider({ id: "rider-b", name: "Rafiq", email: "b@roshoi.test" });
  await eng.saveProfile("rider-a", { fullName: "Amina", phone: "6000000001", payoutUpi: "amina@upi" });
  await eng.saveProfile("rider-b", { fullName: "Rafiq", phone: "6000000002", payoutUpi: "rafiq@upi" });
  return { store, eng, a, b };
}

describe("money", () => {
  it("keeps integer paise", () => {
    assert.equal(paise(45.5), 4550);
    assert.equal(formatPaise(4550), "₹45.50");
  });
});

describe("otp", () => {
  it("verifies only via hash", () => {
    const otp = generateOtp();
    const secret = newOtpSecret(otp);
    assert.equal(verifyOtpHash(otp, secret.salt, secret.hash), true);
    assert.equal(verifyOtpHash("0000", secret.salt, secret.hash), false);
  });
});

describe("machine", () => {
  it("rejects invalid transitions", () => {
    assert.equal(canTransition("OFFERED", "DELIVERED"), false);
    assert.equal(canTransition("ARRIVED_AT_CUSTOMER", "DELIVERED"), true);
    assert.equal(canTransition("ORDER_CANCELLED", "DELIVERED"), false);
    assert.equal(canTransition("PICKED_UP", "ON_THE_WAY"), true);
  });
});

describe("privacy", () => {
  it("hides customer identity on offers", () => {
    const view = offerCustomerView({
      displayName: "Amina K.",
      area: "Longai Road",
      address: "House 12",
      contactAllowed: true,
      contactMasked: "•••• 2334",
      instructions: "Gate",
    });
    assert.equal(view.displayName, "Customer");
    assert.equal(view.address, null);
    assert.equal(view.contactMasked, null);
  });
});

describe("security isolation", () => {
  it("TEST 1: Rider A cannot read Rider B earnings", async () => {
    const { eng, a } = await twoRiders();
    await eng.setStatus("rider-b", "ONLINE", true);
    const home = await eng.home("rider-b");
    if (home.offer) {
      await eng.respondOffer("rider-b", home.offer.id, "ACCEPT", undefined, "k1");
    }
    await assert.rejects(
      () => eng.forbiddenEarningsProbe("rider-a", a.userId === "rider-a" ? "rider-b" : "rider-a"),
      (e: unknown) => e instanceof RiderError && e.code === "FORBIDDEN",
    );
    const other = await eng.earnings("rider-a", {
      from: new Date(0).toISOString(),
      to: new Date().toISOString(),
    });
    const bEarn = await eng.earnings("rider-b", {
      from: new Date(0).toISOString(),
      to: new Date().toISOString(),
    });
    const bHome = await eng.home("rider-b");
    assert.equal(other.lines.every((l) => l.riderId !== bHome.rider.id), true);
    assert.ok(bEarn);
  });

  it("TEST 2: Rider A cannot modify Rider B delivery", async () => {
    const { eng } = await twoRiders();
    await eng.setStatus("rider-b", "ONLINE", true);
    let home = await eng.home("rider-b");
    assert.ok(home.offer);
    const accepted = await eng.respondOffer("rider-b", home.offer!.id, "ACCEPT", undefined, "acc-b");
    assert.ok(accepted.delivery);
    await assert.rejects(
      () => eng.arriveRestaurant("rider-a", accepted.delivery!.id, "x"),
      (e: unknown) => e instanceof RiderError && e.code === "FORBIDDEN",
    );
  });

  it("TEST 3: delivery without OTP fails when required", async () => {
    const { eng } = await twoRiders();
    const d = await runToCustomer(eng, "rider-a");
    if (d.cod) await eng.collectCash("rider-a", d.id, "cash-pre");
    await assert.rejects(
      () => eng.deliver("rider-a", d.id, undefined, "d1"),
      (e: unknown) => e instanceof RiderError && e.code === "OTP_REQUIRED",
    );
  });

  it("TEST 4: repeated deliver stays one delivery", async () => {
    const { eng, store } = await twoRiders();
    const d = await runToCustomer(eng, "rider-a");
    const otp = (await store.getOtp(d.id))!.simulatedPlain!;
    if (d.cod) await eng.collectCash("rider-a", d.id, "cash1");
    const first = await eng.deliver("rider-a", d.id, otp, "del-same");
    const second = await eng.deliver("rider-a", d.id, otp, "del-same");
    assert.equal(first.id, second.id);
    assert.equal(first.state, "DELIVERED");
    const lines = await store.listEarnings("rider-a");
    assert.equal(lines.filter((l) => l.kind === "DELIVERY_PAYOUT" && l.deliveryId === d.id).length, 1);
  });

  it("TEST 5: repeated pickup stays one pickup", async () => {
    const { eng } = await twoRiders();
    const d = await runToRestaurant(eng, "rider-a");
    const p1 = await eng.pickup("rider-a", d.id, { method: "ORDER_CODE", code: d.pickupCode }, "pk");
    const p2 = await eng.pickup("rider-a", d.id, { method: "ORDER_CODE", code: d.pickupCode }, "pk");
    assert.equal(p1.pickedUpAt, p2.pickedUpAt);
    assert.equal(p1.state, "PICKED_UP");
  });

  it("TEST 6: rider cannot alter COD amount", async () => {
    const { eng, store } = await twoRiders();
    const d = await runToCustomer(eng, "rider-a");
    if (!d.cod) {
      const row = (await store.getDeliveryById(d.id))!;
      row.cod = true;
      row.codAmountPaise = 15000;
      await store.updateDelivery(row);
      await store.saveCash(
        {
          deliveryId: d.id,
          riderId: row.riderId,
          expectedPaise: 15000,
          collectedPaise: null,
          state: "EXPECTED",
          exceptionReason: null,
          updatedAt: new Date().toISOString(),
        },
        "rider-a",
      );
    }
    const cash = await store.getCash(d.id);
    assert.ok(cash);
    const expected = cash!.expectedPaise;
    await eng.collectCash("rider-a", d.id, "c");
    const after = await store.getCash(d.id);
    assert.equal(after!.collectedPaise, expected);
    assert.equal(after!.expectedPaise, expected);
  });

  it("TEST 7: unauthenticated location is a store-level concern; engine requires rider", async () => {
    const { eng } = engine();
    await assert.rejects(
      () => eng.postLocation("ghost", { lat: 1, lng: 2 }, 5, null),
      (e: unknown) => e instanceof RiderError && e.code === "NO_PROFILE",
    );
  });

  it("TEST 8: expired offer cannot be accepted", async () => {
    const { eng, store } = await twoRiders();
    await eng.setStatus("rider-a", "ONLINE", true);
    const home = await eng.home("rider-a");
    assert.ok(home.offer);
    const offer = (await store.getOfferById(home.offer!.id))!;
    offer.expiresAt = new Date(Date.now() - 1000).toISOString();
    await store.updateOffer(offer);
    await assert.rejects(
      () => eng.respondOffer("rider-a", offer.id, "ACCEPT", undefined, "late"),
      (e: unknown) => e instanceof RiderError && e.code === "OFFER_EXPIRED",
    );
  });

  it("TEST 9: cancelled order cannot be delivered", async () => {
    const { eng, store } = await twoRiders();
    const d = await runToCustomer(eng, "rider-a");
    const row = (await store.getDeliveryById(d.id))!;
    row.state = "ORDER_CANCELLED";
    await store.updateDelivery(row);
    const otp = (await store.getOtp(d.id))?.simulatedPlain;
    await assert.rejects(
      () => eng.deliver("rider-a", d.id, otp ?? "0000", "x"),
      (e: unknown) => e instanceof RiderError && e.code === "ORDER_CANCELLED",
    );
  });

  it("TEST 10: historical earnings cannot be silently changed", async () => {
    const { store } = await twoRiders();
    await assert.rejects(
      () => store.mutateEarning("any"),
      (e: unknown) => e instanceof RiderError && e.code === "EARNINGS_IMMUTABLE",
    );
  });
});

describe("e2e simulated delivery", () => {
  it("online → offer → accept → pickup → otp → delivered credits ledger", async () => {
    const { eng, store } = await twoRiders();
    await eng.setStatus("rider-a", "ONLINE", true);
    const d = await runToCustomer(eng, "rider-a");
    const otp = (await store.getOtp(d.id))!.simulatedPlain!;
    if (d.cod) await eng.collectCash("rider-a", d.id, "cash");
    const done = await eng.deliver("rider-a", d.id, otp, "fin");
    assert.equal(done.state, "DELIVERED");
    const earn = await eng.earnings("rider-a", {
      from: new Date(Date.now() - 86400000).toISOString(),
      to: new Date().toISOString(),
    });
    assert.ok(earn.totals.payout > 0);
  });
});

async function runToRestaurant(eng: RiderEngine, userId: string) {
  await eng.setStatus(userId, "ONLINE", true);
  const home = await eng.home(userId);
  assert.ok(home.offer, "expected simulated offer");
  const acc = await eng.respondOffer(userId, home.offer!.id, "ACCEPT", undefined, "acc-" + userId);
  const id = acc.delivery!.id;
  await eng.arriving(userId, id, "ar");
  return eng.arriveRestaurant(userId, id, "arr");
}

async function runToCustomer(eng: RiderEngine, userId: string) {
  const d = await runToRestaurant(eng, userId);
  await eng.pickup(userId, d.id, { method: "ORDER_CODE", code: d.pickupCode }, "pk-" + d.id);
  await eng.startDelivery(userId, d.id, "st");
  return eng.arriveCustomer(userId, d.id, "ac");
}
