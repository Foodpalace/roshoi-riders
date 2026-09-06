import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as authMiddleware } from "./middleware-ipdYAC2x.mjs";
import { r as getSql } from "./db-CnKZuPEv.mjs";
import { i as rangePreset, n as RiderEngine, r as RiderError, t as PgStore } from "./pg-store-DFSvL7A2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rider-fns-BkBIQIxO.js
async function engine() {
	const sql = await getSql();
	return new RiderEngine(new PgStore(sql));
}
function fail(e) {
	if (e instanceof RiderError) throw e;
	throw e;
}
var getPublicConfigFn_createServerFn_handler = createServerRpc({
	id: "99b14eb7eab9afec3099f10118a3095c15ae582c0df9e3cc95ea045f1660fb0e",
	name: "getPublicConfigFn",
	filename: "src/lib/server/rider-fns.ts"
}, (opts) => getPublicConfigFn.__executeServer(opts));
var getPublicConfigFn = createServerFn({ method: "GET" }).handler(getPublicConfigFn_createServerFn_handler, async () => {
	return (await engine()).getPublicConfig();
});
var bootstrapRiderFn_createServerFn_handler = createServerRpc({
	id: "48682df83d6da402da9522f9aecead23e80bc9357dab637ff7190133266af13b",
	name: "bootstrapRiderFn",
	filename: "src/lib/server/rider-fns.ts"
}, (opts) => bootstrapRiderFn.__executeServer(opts));
var bootstrapRiderFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(bootstrapRiderFn_createServerFn_handler, async ({ context }) => {
	try {
		return await (await engine()).ensureRider({ id: context.userId });
	} catch (err) {
		fail(err);
	}
});
var getHomeFn_createServerFn_handler = createServerRpc({
	id: "6a897c95cb9fdaa074503d87c61bf06809ce8f5311b89f9c24121ff6250007f4",
	name: "getHomeFn",
	filename: "src/lib/server/rider-fns.ts"
}, (opts) => getHomeFn.__executeServer(opts));
var getHomeFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getHomeFn_createServerFn_handler, async ({ context }) => {
	try {
		const e = await engine();
		await e.ensureRider({ id: context.userId });
		return await e.home(context.userId);
	} catch (err) {
		fail(err);
	}
});
var saveProfileFn_createServerFn_handler = createServerRpc({
	id: "f968094e9af749aef090d34cdf04073a12f813244730922f7b84cff9434de820",
	name: "saveProfileFn",
	filename: "src/lib/server/rider-fns.ts"
}, (opts) => saveProfileFn.__executeServer(opts));
var saveProfileFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(saveProfileFn_createServerFn_handler, async ({ context, data }) => {
	try {
		const e = await engine();
		await e.ensureRider({ id: context.userId });
		return await e.saveProfile(context.userId, data);
	} catch (err) {
		fail(err);
	}
});
var submitKycFn_createServerFn_handler = createServerRpc({
	id: "8c6cb121d96bdb5ad4df1dce84b6706158c2fa361e1e2c985df10f72209607a9",
	name: "submitKycFn",
	filename: "src/lib/server/rider-fns.ts"
}, (opts) => submitKycFn.__executeServer(opts));
var submitKycFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(submitKycFn_createServerFn_handler, async ({ context }) => {
	try {
		return await (await engine()).submitKyc(context.userId);
	} catch (err) {
		fail(err);
	}
});
var setStatusFn_createServerFn_handler = createServerRpc({
	id: "511fd4705ed87e637d1544629f9c353ee4c7786de1c52143f1fef1c8d10d1d45",
	name: "setStatusFn",
	filename: "src/lib/server/rider-fns.ts"
}, (opts) => setStatusFn.__executeServer(opts));
var setStatusFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(setStatusFn_createServerFn_handler, async ({ context, data }) => {
	try {
		return await (await engine()).setStatus(context.userId, data.status, data.confirmed);
	} catch (err) {
		fail(err);
	}
});
var respondOfferFn_createServerFn_handler = createServerRpc({
	id: "2d7fac9a7c0ef58991f78d1dc55c1c9aa53902515155f777ca295cc1ad94867a",
	name: "respondOfferFn",
	filename: "src/lib/server/rider-fns.ts"
}, (opts) => respondOfferFn.__executeServer(opts));
var respondOfferFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(respondOfferFn_createServerFn_handler, async ({ context, data }) => {
	try {
		return await (await engine()).respondOffer(context.userId, data.offerId, data.decision, data.reason, data.idempotencyKey);
	} catch (err) {
		fail(err);
	}
});
var deliveryActionFn_createServerFn_handler = createServerRpc({
	id: "79b0055f57016baf02e5e2e887da2c274fff000b25c5db8ae6d66d930d5dd93f",
	name: "deliveryActionFn",
	filename: "src/lib/server/rider-fns.ts"
}, (opts) => deliveryActionFn.__executeServer(opts));
var deliveryActionFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(deliveryActionFn_createServerFn_handler, async ({ context, data }) => {
	try {
		const e = await engine();
		const id = data.deliveryId;
		const key = data.idempotencyKey;
		switch (data.action) {
			case "ARRIVING": return { delivery: await e.arriving(context.userId, id, key) };
			case "ARRIVE_RESTAURANT": return { delivery: await e.arriveRestaurant(context.userId, id, key) };
			case "NOT_READY": return { delivery: await e.restaurantNotReady(context.userId, id, data.expectedReadyAt ?? null) };
			case "PICKUP": return { delivery: await e.pickup(context.userId, id, {
				method: "ORDER_CODE",
				code: data.pickupCode
			}, key) };
			case "START": return { delivery: await e.startDelivery(context.userId, id, key) };
			case "ARRIVE_CUSTOMER": return { delivery: await e.arriveCustomer(context.userId, id, key) };
			case "COLLECT_CASH": return { cash: await e.collectCash(context.userId, id, key) };
			case "DELIVER": return { delivery: await e.deliver(context.userId, id, data.otp, key) };
			case "UNAVAILABLE": return { delivery: await e.customerUnavailable(context.userId, id) };
			case "CONTACT": return { delivery: await e.contactAttempt(context.userId, id) };
			case "CANCEL": return { delivery: await e.cancelDelivery(context.userId, id, data.reason ?? "", Boolean(data.confirmed), key) };
			case "POD":
				if (!data.pod) throw new RiderError("INVALID", "Photo proof is required", 400);
				return { pod: await e.addPod(context.userId, id, data.pod) };
			default: throw new RiderError("INVALID", "Unknown action", 400);
		}
	} catch (err) {
		fail(err);
	}
});
var postLocationFn_createServerFn_handler = createServerRpc({
	id: "7c7b8772e08e688b3c062148f6b9633c0d965ad9e930cb98626c134161edb11e",
	name: "postLocationFn",
	filename: "src/lib/server/rider-fns.ts"
}, (opts) => postLocationFn.__executeServer(opts));
var postLocationFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(postLocationFn_createServerFn_handler, async ({ context, data }) => {
	try {
		return await (await engine()).postLocation(context.userId, {
			lat: data.lat,
			lng: data.lng
		}, data.accuracyM, data.deliveryId);
	} catch (err) {
		fail(err);
	}
});
var getEarningsFn_createServerFn_handler = createServerRpc({
	id: "37c9d780d1b85c650bba6ea1caac9656fb76272f73ae02fb87e5bbe06b9f7657",
	name: "getEarningsFn",
	filename: "src/lib/server/rider-fns.ts"
}, (opts) => getEarningsFn.__executeServer(opts));
var getEarningsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((input) => input).handler(getEarningsFn_createServerFn_handler, async ({ context, data }) => {
	try {
		const e = await engine();
		const range = data.from && data.to ? {
			from: data.from,
			to: data.to
		} : rangePreset(data.preset);
		return await e.earnings(context.userId, range);
	} catch (err) {
		fail(err);
	}
});
var getHistoryFn_createServerFn_handler = createServerRpc({
	id: "7eb694cfbc5dba54ed933bd44aecea4576e3a08014fd7cda734f12cf650a3e3a",
	name: "getHistoryFn",
	filename: "src/lib/server/rider-fns.ts"
}, (opts) => getHistoryFn.__executeServer(opts));
var getHistoryFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((input) => input).handler(getHistoryFn_createServerFn_handler, async ({ context, data }) => {
	try {
		return await (await engine()).history(context.userId, rangePreset(data.preset));
	} catch (err) {
		fail(err);
	}
});
var getSettlementsFn_createServerFn_handler = createServerRpc({
	id: "92a82d9d9dc4adb491fd97d083f29bac2cd12b10eb915160551bcee996101a31",
	name: "getSettlementsFn",
	filename: "src/lib/server/rider-fns.ts"
}, (opts) => getSettlementsFn.__executeServer(opts));
var getSettlementsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getSettlementsFn_createServerFn_handler, async ({ context }) => {
	try {
		return await (await engine()).settlements(context.userId);
	} catch (err) {
		fail(err);
	}
});
var getPerformanceFn_createServerFn_handler = createServerRpc({
	id: "511d05824ec719710f4ff666fd91db492b4d80df12c78a4726db5f226dae41fd",
	name: "getPerformanceFn",
	filename: "src/lib/server/rider-fns.ts"
}, (opts) => getPerformanceFn.__executeServer(opts));
var getPerformanceFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getPerformanceFn_createServerFn_handler, async ({ context }) => {
	try {
		return await (await engine()).performance(context.userId);
	} catch (err) {
		fail(err);
	}
});
var createTicketFn_createServerFn_handler = createServerRpc({
	id: "82d5964be1b9c20175447e9bd69333c89bca829bb04005c8d1d483961f5d9eb6",
	name: "createTicketFn",
	filename: "src/lib/server/rider-fns.ts"
}, (opts) => createTicketFn.__executeServer(opts));
var createTicketFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createTicketFn_createServerFn_handler, async ({ context, data }) => {
	try {
		return await (await engine()).createTicket(context.userId, {
			topic: data.topic,
			message: data.message,
			deliveryId: data.deliveryId
		}, data.idempotencyKey);
	} catch (err) {
		fail(err);
	}
});
var listTicketsFn_createServerFn_handler = createServerRpc({
	id: "55a95a6351d91d159115cb78952c27b39bd791a46ca0cbd4ef51af5550234cb7",
	name: "listTicketsFn",
	filename: "src/lib/server/rider-fns.ts"
}, (opts) => listTicketsFn.__executeServer(opts));
var listTicketsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listTicketsFn_createServerFn_handler, async ({ context }) => {
	try {
		return await (await engine()).tickets(context.userId);
	} catch (err) {
		fail(err);
	}
});
var reportSafetyFn_createServerFn_handler = createServerRpc({
	id: "3a2f4ee43f0148fc15652e18e0d81e5bcda14e905e5999dbe87d0b84c76dc7c0",
	name: "reportSafetyFn",
	filename: "src/lib/server/rider-fns.ts"
}, (opts) => reportSafetyFn.__executeServer(opts));
var reportSafetyFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(reportSafetyFn_createServerFn_handler, async ({ context, data }) => {
	try {
		return await (await engine()).safety(context.userId, {
			kind: data.kind,
			note: data.note,
			deliveryId: data.deliveryId,
			location: data.lat != null && data.lng != null ? {
				lat: data.lat,
				lng: data.lng
			} : null
		});
	} catch (err) {
		fail(err);
	}
});
var listNotificationsFn_createServerFn_handler = createServerRpc({
	id: "0e984367e1fb768bb4af66f1123e00565367a307079eedca064abd9e484d2482",
	name: "listNotificationsFn",
	filename: "src/lib/server/rider-fns.ts"
}, (opts) => listNotificationsFn.__executeServer(opts));
var listNotificationsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listNotificationsFn_createServerFn_handler, async ({ context }) => {
	try {
		return await (await engine()).notifications(context.userId);
	} catch (err) {
		fail(err);
	}
});
var setLocaleFn_createServerFn_handler = createServerRpc({
	id: "6dbec1a34c0a71ecbb15208d3a55a31da9bc84ebee169cfe9ac846ef5a44db3c",
	name: "setLocaleFn",
	filename: "src/lib/server/rider-fns.ts"
}, (opts) => setLocaleFn.__executeServer(opts));
var setLocaleFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(setLocaleFn_createServerFn_handler, async ({ context, data }) => {
	try {
		const e = await engine();
		await e.ensureRider({ id: context.userId });
		return await e.setLocale(context.userId, data.locale);
	} catch (err) {
		fail(err);
	}
});
var getDeliveryFn_createServerFn_handler = createServerRpc({
	id: "18387f9a7402c72c72afd5b44d9f27dce57f6b197eb8d1fff5576018ded5b445",
	name: "getDeliveryFn",
	filename: "src/lib/server/rider-fns.ts"
}, (opts) => getDeliveryFn.__executeServer(opts));
var getDeliveryFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((input) => input).handler(getDeliveryFn_createServerFn_handler, async ({ context, data }) => {
	try {
		const e = await engine();
		return {
			delivery: await e.getDelivery(context.userId, data.deliveryId),
			simulatedOtp: await e.otpForSimulation(context.userId, data.deliveryId)
		};
	} catch (err) {
		fail(err);
	}
});
var assistantSnapshotFn_createServerFn_handler = createServerRpc({
	id: "6d7d5e8d91d454409a35fe230025b9053e47e6595567f74bfd99e0dc5b9451d3",
	name: "assistantSnapshotFn",
	filename: "src/lib/server/rider-fns.ts"
}, (opts) => assistantSnapshotFn.__executeServer(opts));
var assistantSnapshotFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(assistantSnapshotFn_createServerFn_handler, async ({ context }) => {
	try {
		return await (await engine()).snapshotForAssistant(context.userId);
	} catch (err) {
		fail(err);
	}
});
//#endregion
export { assistantSnapshotFn_createServerFn_handler, bootstrapRiderFn_createServerFn_handler, createTicketFn_createServerFn_handler, deliveryActionFn_createServerFn_handler, getDeliveryFn_createServerFn_handler, getEarningsFn_createServerFn_handler, getHistoryFn_createServerFn_handler, getHomeFn_createServerFn_handler, getPerformanceFn_createServerFn_handler, getPublicConfigFn_createServerFn_handler, getSettlementsFn_createServerFn_handler, listNotificationsFn_createServerFn_handler, listTicketsFn_createServerFn_handler, postLocationFn_createServerFn_handler, reportSafetyFn_createServerFn_handler, respondOfferFn_createServerFn_handler, saveProfileFn_createServerFn_handler, setLocaleFn_createServerFn_handler, setStatusFn_createServerFn_handler, submitKycFn_createServerFn_handler };
