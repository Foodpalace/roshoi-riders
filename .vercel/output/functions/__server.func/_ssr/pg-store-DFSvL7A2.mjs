import { n as DEFAULT_CONFIG } from "./config-BVkxo9ab.mjs";
import { a as simulatedRestaurant, i as simulatedCustomer, n as minimizeCustomer, r as offerCustomerView } from "./catalog-CBGXwXS0.mjs";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/pg-store-DFSvL7A2.js
var EARTH_KM = 6371;
function haversineKm(a, b) {
	const toRad = (d) => d * Math.PI / 180;
	const dLat = toRad(b.lat - a.lat);
	const dLng = toRad(b.lng - a.lng);
	const lat1 = toRad(a.lat);
	const lat2 = toRad(b.lat);
	const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
	return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}
function nid() {
	return crypto.randomUUID();
}
function orderCode() {
	return `RSH-${Math.floor(1e3 + Math.random() * 9e3)}`;
}
var RiderError = class extends Error {
	code;
	status;
	constructor(code, message, status = 400) {
		super(message);
		this.code = code;
		this.status = status;
		this.name = "RiderError";
	}
};
var ALLOWED = {
	OFFERED: [
		"ACCEPTED",
		"RIDER_DECLINED",
		"OFFER_EXPIRED",
		"ORDER_CANCELLED"
	],
	ACCEPTED: [
		"ARRIVING_AT_RESTAURANT",
		"RIDER_CANCELLED",
		"ORDER_CANCELLED",
		"SUPPORT_ESCALATION"
	],
	ARRIVING_AT_RESTAURANT: [
		"ARRIVED_AT_RESTAURANT",
		"RIDER_CANCELLED",
		"ORDER_CANCELLED",
		"SUPPORT_ESCALATION"
	],
	ARRIVED_AT_RESTAURANT: [
		"PICKED_UP",
		"RESTAURANT_NOT_READY",
		"RIDER_CANCELLED",
		"ORDER_CANCELLED",
		"SUPPORT_ESCALATION"
	],
	RESTAURANT_NOT_READY: [
		"PICKED_UP",
		"RIDER_CANCELLED",
		"ORDER_CANCELLED",
		"SUPPORT_ESCALATION"
	],
	PICKED_UP: [
		"ON_THE_WAY",
		"RIDER_CANCELLED",
		"ORDER_CANCELLED",
		"SUPPORT_ESCALATION"
	],
	ON_THE_WAY: [
		"ARRIVED_AT_CUSTOMER",
		"CUSTOMER_UNAVAILABLE",
		"RIDER_CANCELLED",
		"ORDER_CANCELLED",
		"SUPPORT_ESCALATION",
		"DELIVERY_FAILED"
	],
	ARRIVED_AT_CUSTOMER: [
		"DELIVERED",
		"CUSTOMER_UNAVAILABLE",
		"DELIVERY_FAILED",
		"SUPPORT_ESCALATION",
		"ORDER_CANCELLED"
	],
	CUSTOMER_UNAVAILABLE: [
		"SUPPORT_ESCALATION",
		"DELIVERY_FAILED",
		"ORDER_CANCELLED"
	],
	SUPPORT_ESCALATION: [
		"DELIVERED",
		"DELIVERY_FAILED",
		"ORDER_CANCELLED",
		"PICKED_UP",
		"ON_THE_WAY",
		"ARRIVED_AT_CUSTOMER",
		"ARRIVED_AT_RESTAURANT"
	],
	DELIVERED: [],
	OFFER_EXPIRED: [],
	RIDER_DECLINED: [],
	RIDER_CANCELLED: [],
	DELIVERY_FAILED: [],
	ORDER_CANCELLED: []
};
function canTransition(from, to) {
	if (from === to) return false;
	return (ALLOWED[from] ?? []).includes(to);
}
function assertTransition(from, to) {
	if (!canTransition(from, to)) throw new Error(`Invalid delivery transition ${from} → ${to}`);
}
function generateOtp(length = 4) {
	const n = 10 ** length;
	const val = randomBytes(4).readUInt32BE(0) % n;
	return String(val).padStart(length, "0");
}
function hashOtp(otp, salt) {
	return createHash("sha256").update(`${salt}:${otp}`).digest("hex");
}
function newOtpSecret(otp) {
	const salt = randomBytes(16).toString("hex");
	return {
		salt,
		hash: hashOtp(otp, salt)
	};
}
function verifyOtpHash(otp, salt, expectedHash) {
	const got = hashOtp(otp.trim(), salt);
	if (got.length !== expectedHash.length) return false;
	return timingSafeEqual(Buffer.from(got), Buffer.from(expectedHash));
}
function isPlausibleOtp(otp) {
	return /^\d{4,6}$/.test(otp.trim());
}
var CANCEL_REASONS = [
	"vehicle problem",
	"safety issue",
	"wrong assignment",
	"restaurant issue",
	"customer issue",
	"other"
];
var RiderEngine = class {
	store;
	constructor(store) {
		this.store = store;
	}
	async cfg() {
		return this.store.getConfig();
	}
	now() {
		return (/* @__PURE__ */ new Date()).toISOString();
	}
	async audit(actorId, action, resource, resourceId, meta = "") {
		await this.store.appendAudit({
			id: nid(),
			actorId,
			action,
			resource,
			resourceId,
			at: this.now(),
			meta
		});
	}
	async requireRider(userId) {
		const r = await this.store.getRiderByUserId(userId);
		if (!r) throw new RiderError("NO_PROFILE", "Complete onboarding first", 400);
		return r;
	}
	async requireOwnedDelivery(userId, deliveryId) {
		const d = await this.store.getDeliveryById(deliveryId);
		if (!d) throw new RiderError("NOT_FOUND", "Delivery not found", 404);
		if (d.userId !== userId) throw new RiderError("FORBIDDEN", "You cannot access another rider's delivery", 403);
		return d;
	}
	async idem(userId, key, action, run) {
		if (!key) return run();
		const existing = await this.store.getIdempotency(userId, key);
		if (existing) return JSON.parse(existing.responseJson);
		const value = await run();
		await this.store.saveIdempotency({
			userId,
			key,
			action,
			resourceId: value?.id ?? "",
			responseJson: JSON.stringify(value),
			createdAt: this.now()
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
			podMethods: c.podMethods
		};
	}
	async ensureRider(user) {
		const existing = await this.store.getRiderByUserId(user.id);
		if (existing) return existing;
		const now = this.now();
		const rider = {
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
			dataMode: "SIMULATED"
		};
		await this.store.upsertRider(rider);
		await this.audit(user.id, "RIDER_CREATED", "rider", rider.id);
		return rider;
	}
	async saveProfile(userId, patch) {
		const rider = await this.requireRider(userId);
		const cfg = await this.cfg();
		if (patch.riderType === "VOLUNTEER" && !cfg.volunteerEnabled) throw new RiderError("FLAG_OFF", "Volunteer type is not enabled", 400);
		const allowedTypes = [
			"DELIVERY_PARTNER",
			"PART_TIME",
			"FULL_TIME"
		];
		if (cfg.volunteerEnabled) allowedTypes.push("VOLUNTEER");
		if (patch.riderType && !allowedTypes.includes(patch.riderType)) throw new RiderError("INVALID", "Unknown rider type", 400);
		const next = {
			...rider,
			...patch,
			userId: rider.userId,
			id: rider.id,
			kycStatus: rider.kycStatus === "VERIFIED" ? rider.kycStatus : rider.kycStatus,
			updatedAt: this.now()
		};
		if (rider.kycStatus === "VERIFIED" && this.kycFieldsChanged(rider, next)) next.kycStatus = "UNDER_REVIEW";
		await this.store.upsertRider(next);
		return next;
	}
	kycFieldsChanged(a, b) {
		return a.fullName !== b.fullName || a.governmentIdLast4 !== b.governmentIdLast4 || a.vehicleRegistration !== b.vehicleRegistration || a.licenceNumber !== b.licenceNumber;
	}
	async submitKyc(userId) {
		const rider = await this.requireRider(userId);
		if (!rider.fullName.trim() || !rider.phone.trim()) throw new RiderError("INCOMPLETE", "Name and phone are required", 400);
		if (!rider.payoutUpi?.trim()) throw new RiderError("INCOMPLETE", "UPI payout details are required", 400);
		const next = {
			...rider,
			kycStatus: "UNDER_REVIEW",
			updatedAt: this.now()
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
			createdAt: this.now()
		});
		return next;
	}
	async setStatus(userId, status, confirmed) {
		if (!confirmed) throw new RiderError("CONFIRM_REQUIRED", "Confirm this status change", 400);
		const rider = await this.requireRider(userId);
		const cfg = await this.cfg();
		if (status === "ONLINE" && cfg.dataMode === "LIVE" && rider.kycStatus !== "VERIFIED") throw new RiderError("KYC", "Unverified partners cannot go online for live orders", 403);
		const active = await this.store.getActiveDeliveryForRider(rider.id);
		if (status === "OFFLINE" && active) throw new RiderError("BUSY", "Finish the current delivery before going offline", 400);
		if (status === "ONLINE" && active) status = "BUSY";
		const next = {
			...rider,
			status,
			onlineSince: status === "OFFLINE" ? null : rider.onlineSince ?? this.now(),
			updatedAt: this.now()
		};
		await this.store.upsertRider(next);
		await this.audit(userId, "STATUS", "rider", rider.id, status);
		if (status === "ONLINE") await this.maybeDispatch(rider.id, userId);
		return next;
	}
	async tick(userId) {
		const rider = await this.store.getRiderByUserId(userId);
		if (!rider) return {
			rider: null,
			offer: null
		};
		await this.expireOffers(rider);
		if (rider.status === "ONLINE") await this.maybeDispatch(rider.id, userId);
		const offer = await this.store.getOpenOfferForRider(rider.id);
		return {
			rider,
			offer: offer ? this.presentOffer(offer) : null
		};
	}
	async expireOffers(rider) {
		const offer = await this.store.getOpenOfferForRider(rider.id);
		if (!offer) return;
		if (new Date(offer.expiresAt).getTime() <= Date.now()) {
			offer.status = "EXPIRED";
			await this.store.updateOffer(offer);
			await this.audit(rider.userId, "OFFER_EXPIRED", "offer", offer.id);
		}
	}
	async maybeDispatch(riderId, userId) {
		const cfg = await this.cfg();
		if (await this.store.getActiveDeliveryForRider(riderId)) return;
		if (await this.store.getOpenOfferForRider(riderId)) return;
		const restaurant = simulatedRestaurant();
		const customer = simulatedCustomer();
		const pickup = restaurant.location;
		const drop = customer.location;
		const km = Math.round(haversineKm(pickup, drop) * 100) / 100;
		const travel = Math.round(km * cfg.travelFactor * 100) / 100;
		const now = Date.now();
		const payout = 3500 + Math.round(km * 800);
		const cod = cfg.flags.cod && Math.random() < .45;
		const offer = {
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
			estimatedTotalRouteKm: travel + .4,
			expectedPayoutPaise: payout,
			cod,
			codAmountPaise: cod ? 12e3 + Math.round(Math.random() * 18e3) : 0,
			packageCount: 1 + (Math.random() < .2 ? 1 : 0),
			expiresAt: new Date(now + cfg.offerTimeoutSeconds * 1e3).toISOString(),
			status: "OPEN",
			createdAt: new Date(now).toISOString(),
			dataMode: "SIMULATED"
		};
		await this.store.insertOffer(offer, userId);
		await this.store.insertNotification({
			id: nid(),
			userId,
			title: "New delivery offer",
			body: `${restaurant.name} · ${customer.slice.area}`,
			kind: "OFFER",
			read: false,
			createdAt: this.now()
		});
	}
	presentOffer(offer) {
		return {
			...offer,
			customer: offerCustomerView(offer.customer)
		};
	}
	async respondOffer(userId, offerId, decision, reason, idempotencyKey) {
		return this.idem(userId, idempotencyKey, "offer.respond", async () => {
			const rider = await this.requireRider(userId);
			const offer = await this.store.getOfferById(offerId);
			if (!offer) throw new RiderError("NOT_FOUND", "Offer not found", 404);
			const owner = await this.store.getRiderById(offer.riderId);
			if (!owner || owner.userId !== userId) throw new RiderError("FORBIDDEN", "You cannot respond to another rider's offer", 403);
			if (offer.status !== "OPEN") throw new RiderError("OFFER_GONE", "This offer is no longer available", 409);
			if (new Date(offer.expiresAt).getTime() <= Date.now()) {
				offer.status = "EXPIRED";
				await this.store.updateOffer(offer);
				throw new RiderError("OFFER_EXPIRED", "This offer has expired", 409);
			}
			if (decision === "DECLINE") {
				offer.status = "DECLINED";
				await this.store.updateOffer(offer);
				await this.audit(userId, "OFFER_DECLINED", "offer", offer.id, reason ?? "");
				return {
					decision,
					delivery: null,
					offer
				};
			}
			if (await this.store.getActiveDeliveryForRider(rider.id)) throw new RiderError("BUSY", "You already have an active delivery", 409);
			offer.status = "ACCEPTED";
			await this.store.updateOffer(offer);
			const delivery = await this.createDeliveryFromOffer(rider, offer);
			const busy = {
				...rider,
				status: "BUSY",
				updatedAt: this.now()
			};
			await this.store.upsertRider(busy);
			return {
				decision,
				delivery,
				offer
			};
		});
	}
	async createDeliveryFromOffer(rider, offer) {
		const cfg = await this.cfg();
		const now = this.now();
		const delivery = {
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
			pickupCode: String(1e3 + Math.floor(Math.random() * 9e3)),
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
			dataMode: "SIMULATED"
		};
		await this.store.insertDelivery(delivery);
		await this.recordTransition(delivery, null, "ACCEPTED", "RIDER", rider.userId, "accepted offer");
		if (cfg.flags.delivery_otp) {
			const otp = generateOtp(4);
			const secret = newOtpSecret(otp);
			await this.store.saveOtp({
				deliveryId: delivery.id,
				hash: secret.hash,
				salt: secret.salt,
				attempts: 0,
				verifiedAt: null,
				simulatedPlain: otp
			}, rider.userId);
		}
		if (offer.cod && cfg.flags.cod) await this.store.saveCash({
			deliveryId: delivery.id,
			riderId: rider.id,
			expectedPaise: offer.codAmountPaise,
			collectedPaise: null,
			state: "EXPECTED",
			exceptionReason: null,
			updatedAt: now
		}, rider.userId);
		return this.presentDelivery(delivery);
	}
	presentDelivery(d) {
		return {
			...d,
			customer: minimizeCustomer(d.customer, d.state)
		};
	}
	async getDelivery(userId, deliveryId) {
		const d = await this.requireOwnedDelivery(userId, deliveryId);
		return this.presentDelivery(d);
	}
	async getActiveDelivery(userId) {
		const rider = await this.requireRider(userId);
		const d = await this.store.getActiveDeliveryForRider(rider.id);
		return d ? this.presentDelivery(d) : null;
	}
	async transition(userId, deliveryId, to, reason, extra) {
		const d = await this.requireOwnedDelivery(userId, deliveryId);
		if (d.state === "ORDER_CANCELLED") throw new RiderError("ORDER_CANCELLED", "This order was cancelled. Do not deliver it.", 409);
		assertTransition(d.state, to);
		const prev = d.state;
		extra?.(d);
		d.state = to;
		d.updatedAt = this.now();
		await this.store.updateDelivery(d);
		await this.recordTransition(d, prev, to, "RIDER", userId, reason);
		if (to === "DELIVERED" || to === "RIDER_CANCELLED" || to === "DELIVERY_FAILED") {
			const rider = await this.requireRider(userId);
			if (!await this.store.getActiveDeliveryForRider(rider.id) && rider.status === "BUSY") await this.store.upsertRider({
				...rider,
				status: "ONLINE",
				updatedAt: this.now()
			});
		}
		return this.presentDelivery(d);
	}
	async recordTransition(d, prev, next, actor, actorId, reason) {
		await this.store.insertEvent({
			id: nid(),
			deliveryId: d.id,
			previousState: prev,
			newState: next,
			actor,
			actorId,
			reason,
			at: this.now()
		}, d.userId);
	}
	async arriving(userId, deliveryId, key) {
		return this.idem(userId, key, "arrive.going", () => this.transition(userId, deliveryId, "ARRIVING_AT_RESTAURANT", null));
	}
	async arriveRestaurant(userId, deliveryId, key) {
		return this.idem(userId, key, "arrive.restaurant", () => this.transition(userId, deliveryId, "ARRIVED_AT_RESTAURANT", null, (d) => {
			d.arrivedRestaurantAt = this.now();
		}));
	}
	async restaurantNotReady(userId, deliveryId, expectedReadyAt) {
		return this.transition(userId, deliveryId, "RESTAURANT_NOT_READY", "restaurant not ready", (d) => {
			d.expectedReadyAt = expectedReadyAt;
		});
	}
	async pickup(userId, deliveryId, verification, key) {
		return this.idem(userId, key, "pickup", async () => {
			const d = await this.requireOwnedDelivery(userId, deliveryId);
			if (d.state !== "ARRIVED_AT_RESTAURANT" && d.state !== "RESTAURANT_NOT_READY") throw new RiderError("INVALID_STATE", "Pickup is not allowed in this state", 409);
			if (d.pickedUpAt) return this.presentDelivery(d);
			const cfg = await this.cfg();
			if (cfg.pickupVerification === "ORDER_CODE" || cfg.pickupVerification === "PIN") {
				if (!verification.code || verification.code.trim() !== d.pickupCode) throw new RiderError("PICKUP_CODE", "Pickup code does not match", 400);
			}
			return this.transition(userId, deliveryId, "PICKED_UP", "picked up", (row) => {
				row.pickedUpAt = this.now();
			});
		});
	}
	async startDelivery(userId, deliveryId, key) {
		return this.idem(userId, key, "start", () => this.transition(userId, deliveryId, "ON_THE_WAY", null));
	}
	async arriveCustomer(userId, deliveryId, key) {
		return this.idem(userId, key, "arrive.customer", () => this.transition(userId, deliveryId, "ARRIVED_AT_CUSTOMER", null, (d) => {
			d.arrivedCustomerAt = this.now();
		}));
	}
	async collectCash(userId, deliveryId, key) {
		return this.idem(userId, key, "cash", async () => {
			const d = await this.requireOwnedDelivery(userId, deliveryId);
			const cash = await this.store.getCash(deliveryId);
			if (!d.cod || !cash) throw new RiderError("NOT_COD", "This order is not cash on delivery", 400);
			if (cash.state === "COLLECTED" || cash.state === "RECONCILED") return cash;
			if (d.state !== "ARRIVED_AT_CUSTOMER" && d.state !== "SUPPORT_ESCALATION") throw new RiderError("INVALID_STATE", "Collect cash only at the customer", 409);
			cash.collectedPaise = cash.expectedPaise;
			cash.state = "COLLECTED";
			cash.updatedAt = this.now();
			await this.store.saveCash(cash, userId);
			await this.audit(userId, "CASH_COLLECTED", "cash", deliveryId, String(cash.expectedPaise));
			return cash;
		});
	}
	async deliver(userId, deliveryId, otp, key) {
		return this.idem(userId, key, "deliver", async () => {
			const cfg = await this.cfg();
			const d = await this.requireOwnedDelivery(userId, deliveryId);
			if (d.state === "DELIVERED") return this.presentDelivery(d);
			if (d.state === "ORDER_CANCELLED") throw new RiderError("ORDER_CANCELLED", "This order was cancelled. Do not deliver it.", 409);
			if (d.state !== "ARRIVED_AT_CUSTOMER" && d.state !== "SUPPORT_ESCALATION") throw new RiderError("INVALID_STATE", "Arrive at the customer before completing delivery", 409);
			if (d.cod) {
				const cash = await this.store.getCash(deliveryId);
				if (!cash || cash.state === "EXPECTED") throw new RiderError("CASH_REQUIRED", "Collect cash before completing this delivery", 400);
			}
			if (cfg.flags.delivery_otp && d.otpRequired) {
				if (!otp || !isPlausibleOtp(otp)) throw new RiderError("OTP_REQUIRED", "Enter the customer OTP to complete delivery", 400);
				const rec = await this.store.getOtp(deliveryId);
				if (!rec) throw new RiderError("OTP_MISSING", "OTP is not available for this delivery", 500);
				if (rec.verifiedAt) {} else {
					const ok = verifyOtpHash(otp, rec.salt, rec.hash);
					rec.attempts += 1;
					if (!ok) {
						await this.store.saveOtp(rec, userId);
						if (rec.attempts >= cfg.otpSuspiciousThreshold) await this.store.insertSignal({
							id: nid(),
							riderId: d.riderId,
							deliveryId: d.id,
							kind: "REPEATED_FAILED_OTP",
							detail: `${rec.attempts} failed attempts`,
							stage: "SIGNAL",
							createdAt: this.now()
						}, userId);
						if (rec.attempts >= cfg.otpMaxAttempts) throw new RiderError("OTP_LOCKED", "Too many attempts. Support has been notified.", 429);
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
	async creditEarnings(d) {
		if ((await this.store.listEarnings(d.userId)).some((e) => e.deliveryId === d.id && e.kind === "DELIVERY_PAYOUT")) return;
		const cfg = await this.cfg();
		const lines = [{
			id: nid(),
			riderId: d.riderId,
			deliveryId: d.id,
			orderCode: d.orderCode,
			kind: "DELIVERY_PAYOUT",
			amountPaise: d.expectedPayoutPaise,
			note: "Delivery payout",
			at: this.now(),
			dataMode: "SIMULATED"
		}];
		if (cfg.flags.incentives && d.packageCount > 1) lines.push({
			id: nid(),
			riderId: d.riderId,
			deliveryId: d.id,
			orderCode: d.orderCode,
			kind: "INCENTIVE",
			amountPaise: 500,
			note: "Multi-package",
			at: this.now(),
			dataMode: "SIMULATED"
		});
		for (const line of lines) await this.store.appendEarning(line, d.userId);
	}
	async addPod(userId, deliveryId, input) {
		const cfg = await this.cfg();
		const d = await this.requireOwnedDelivery(userId, deliveryId);
		if (input.method === "PHOTO") {
			if (!cfg.flags.pod_photo) throw new RiderError("FLAG_OFF", "Photo proof is not enabled", 400);
			if (!input.contentType || !/^image\/(jpeg|png|webp)$/.test(input.contentType)) throw new RiderError("FILE_TYPE", "Photo must be jpeg, png, or webp", 400);
			if ((input.bytes ?? 0) > cfg.podMaxBytes) throw new RiderError("FILE_SIZE", "Photo is too large", 400);
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
			dataMode: "SIMULATED"
		};
		await this.store.insertPod(pod, userId);
		return {
			id: pod.id,
			method: pod.method,
			capturedAt: pod.capturedAt
		};
	}
	async customerUnavailable(userId, deliveryId) {
		return this.transition(userId, deliveryId, "CUSTOMER_UNAVAILABLE", "customer not available", (d) => {
			d.waitStartedAt = d.waitStartedAt ?? this.now();
		});
	}
	async contactAttempt(userId, deliveryId) {
		const d = await this.requireOwnedDelivery(userId, deliveryId);
		d.contactAttempts += 1;
		d.updatedAt = this.now();
		await this.store.updateDelivery(d);
		await this.audit(userId, "CONTACT_ATTEMPT", "delivery", d.id, String(d.contactAttempts));
		return this.presentDelivery(d);
	}
	async cancelDelivery(userId, deliveryId, reason, confirmed, key) {
		if (!confirmed) throw new RiderError("CONFIRM_REQUIRED", "Confirm cancellation", 400);
		const normalized = reason.trim().toLowerCase();
		if (!CANCEL_REASONS.includes(normalized)) throw new RiderError("REASON_REQUIRED", "Choose a valid cancellation reason", 400);
		return this.idem(userId, key, "cancel", () => this.transition(userId, deliveryId, "RIDER_CANCELLED", normalized, (d) => {
			d.cancelReason = normalized;
		}));
	}
	async adminCancelOrder(userId, deliveryId) {
		const d = await this.requireOwnedDelivery(userId, deliveryId);
		if (d.state === "DELIVERED") throw new RiderError("ALREADY_DELIVERED", "Cannot cancel a delivered order", 409);
		d.state = "ORDER_CANCELLED";
		d.updatedAt = this.now();
		await this.store.updateDelivery(d);
		await this.recordTransition(d, d.state, "ORDER_CANCELLED", "SYSTEM", userId, "order cancelled");
		return this.presentDelivery(d);
	}
	async postLocation(userId, point, accuracyM, deliveryId) {
		const rider = await this.requireRider(userId);
		if (rider.status === "OFFLINE" && !deliveryId) throw new RiderError("NOT_TRACKING", "Location is only used while online or on a delivery", 400);
		const cfg = await this.cfg();
		if (!cfg.flags.live_tracking) throw new RiderError("FLAG_OFF", "Live tracking is off", 400);
		if (deliveryId) await this.requireOwnedDelivery(userId, deliveryId);
		const ping = {
			id: nid(),
			riderId: rider.id,
			deliveryId,
			point,
			accuracyM,
			at: this.now()
		};
		await this.store.insertLocation(ping, userId);
		const keepAfter = (/* @__PURE__ */ new Date(Date.now() - cfg.locationRetentionHours * 36e5)).toISOString();
		await this.store.pruneLocations(userId, keepAfter, cfg.gpsHistoryMaxPings);
		return {
			ok: true,
			at: ping.at
		};
	}
	async home(userId) {
		const rider = await this.requireRider(userId);
		await this.expireOffers(rider);
		if (rider.status === "ONLINE") await this.maybeDispatch(rider.id, userId);
		const offerRaw = await this.store.getOpenOfferForRider(rider.id);
		const offer = offerRaw && new Date(offerRaw.expiresAt).getTime() > Date.now() ? this.presentOffer(offerRaw) : null;
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
		const pendingCash = cashRows.filter((c) => c.state === "COLLECTED").reduce((a, c) => a + (c.collectedPaise ?? 0), 0);
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
			dataMode: (await this.cfg()).dataMode
		};
	}
	async earnings(userId, range) {
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
				netPayable: net
			},
			dataMode: "SIMULATED"
		};
	}
	async settlements(userId) {
		const rider = await this.requireRider(userId);
		let rows = await this.store.listSettlements(userId);
		if (rows.length === 0) {
			const net = (await this.store.listEarnings(userId)).reduce((a, e) => a + e.amountPaise, 0);
			const s = {
				id: nid(),
				riderId: rider.id,
				periodStart: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
				periodEnd: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
				amountPaise: net,
				status: "PAYABLE",
				confirmedPaidAt: null,
				dataMode: "SIMULATED"
			};
			await this.store.insertSettlement(s, userId);
			rows = [s];
		}
		return rows;
	}
	async history(userId, range) {
		await this.requireRider(userId);
		const deliveries = await this.store.listDeliveriesForUser(userId, range);
		const earnings = await this.store.listEarnings(userId, range);
		return deliveries.map((d) => {
			const related = earnings.filter((e) => e.deliveryId === d.id);
			return {
				delivery: this.presentDelivery(d),
				payout: sumKind(related, "DELIVERY_PAYOUT"),
				incentive: sumKind(related, "INCENTIVE"),
				adjustment: sumKind(related, "ADJUSTMENT")
			};
		});
	}
	async performance(userId) {
		await this.requireRider(userId);
		const all = await this.store.listDeliveriesForUser(userId);
		const completed = all.filter((d) => d.state === "DELIVERED").length;
		const cancelled = all.filter((d) => d.state === "RIDER_CANCELLED").length;
		const accepted = all.filter((d) => d.state !== "RIDER_DECLINED" && d.state !== "OFFER_EXPIRED").length;
		const net = (await this.store.listEarnings(userId)).reduce((a, e) => a + e.amountPaise, 0);
		return {
			completed,
			offered: accepted + cancelled,
			accepted,
			cancelled,
			onTimePickup: completed,
			successfulDelivery: completed,
			earningsPerOrderPaise: completed ? Math.round(net / completed) : 0
		};
	}
	async createTicket(userId, input, key) {
		return this.idem(userId, key, "ticket", async () => {
			const rider = await this.requireRider(userId);
			if (input.deliveryId) await this.requireOwnedDelivery(userId, input.deliveryId);
			const ticket = {
				id: nid(),
				riderId: rider.id,
				deliveryId: input.deliveryId ?? null,
				topic: input.topic,
				message: input.message.trim(),
				status: "OPEN",
				createdAt: this.now(),
				updatedAt: this.now()
			};
			if (!ticket.message) throw new RiderError("INVALID", "Message is required", 400);
			await this.store.insertTicket(ticket, userId);
			return ticket;
		});
	}
	async tickets(userId) {
		await this.requireRider(userId);
		return this.store.listTickets(userId);
	}
	async safety(userId, input) {
		const rider = await this.requireRider(userId);
		const incident = {
			id: nid(),
			riderId: rider.id,
			deliveryId: input.deliveryId ?? null,
			kind: input.kind,
			note: input.note,
			location: input.location ?? null,
			createdAt: this.now(),
			emergencyDispatched: false
		};
		await this.store.insertSafety(incident, userId);
		return incident;
	}
	async notifications(userId) {
		await this.requireRider(userId);
		return this.store.listNotifications(userId);
	}
	async setLocale(userId, locale) {
		return this.saveProfile(userId, { locale });
	}
	async otpForSimulation(userId, deliveryId) {
		const d = await this.requireOwnedDelivery(userId, deliveryId);
		return (await this.store.getOtp(d.id))?.simulatedPlain ?? null;
	}
	async snapshotForAssistant(userId) {
		const home = await this.home(userId);
		const range = todayRange();
		const earnings = await this.earnings(userId, range);
		const history = await this.history(userId, range);
		return {
			dataMode: "SIMULATED",
			riderName: home.rider.fullName,
			status: home.rider.status,
			kycStatus: home.rider.kycStatus,
			todayEarningsPaise: earnings.totals.net,
			completedToday: home.completedToday,
			currentDelivery: home.active ? {
				orderCode: home.active.orderCode,
				state: home.active.state,
				restaurant: home.active.restaurant.name,
				dropArea: home.active.customer.area
			} : null,
			history: history.map((h) => ({
				orderCode: h.delivery.orderCode,
				state: h.delivery.state,
				payoutPaise: h.payout
			})),
			payoutTotals: earnings.totals
		};
	}
	async forbiddenEarningsProbe(actorUserId, otherUserId) {
		if (actorUserId === otherUserId) return this.earnings(actorUserId, todayRange());
		throw new RiderError("FORBIDDEN", "You cannot access another rider's earnings", 403);
	}
};
function sumKind(lines, kind) {
	return lines.filter((l) => l.kind === kind).reduce((a, l) => a + l.amountPaise, 0);
}
function todayRange(now = /* @__PURE__ */ new Date()) {
	const start = new Date(now);
	start.setHours(0, 0, 0, 0);
	const end = new Date(now);
	end.setHours(23, 59, 59, 999);
	return {
		from: start.toISOString(),
		to: end.toISOString()
	};
}
function rangePreset(preset, now = /* @__PURE__ */ new Date()) {
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
		return {
			from: from.toISOString(),
			to: now.toISOString()
		};
	}
	const from = new Date(now);
	from.setDate(1);
	from.setHours(0, 0, 0, 0);
	return {
		from: from.toISOString(),
		to: now.toISOString()
	};
}
function iso(v) {
	if (v instanceof Date) return v.toISOString();
	if (typeof v === "string") return v;
	return String(v ?? "");
}
function json(v, fallback) {
	if (v == null) return fallback;
	if (typeof v === "object") return v;
	if (typeof v === "string") try {
		return JSON.parse(v);
	} catch {
		return fallback;
	}
	return fallback;
}
function num(v) {
	if (typeof v === "number") return v;
	if (typeof v === "string") return Number(v);
	return 0;
}
function riderFromRow(row) {
	return {
		id: String(row.id),
		userId: String(row.user_id),
		fullName: String(row.full_name ?? ""),
		phone: String(row.phone ?? ""),
		email: String(row.email ?? ""),
		photoUrl: row.photo_url ? String(row.photo_url) : null,
		address: String(row.address ?? ""),
		emergencyName: String(row.emergency_name ?? ""),
		emergencyPhone: String(row.emergency_phone ?? ""),
		dateOfBirth: row.date_of_birth ? String(row.date_of_birth) : null,
		governmentIdType: row.government_id_type ? String(row.government_id_type) : null,
		governmentIdLast4: row.government_id_last4 ? String(row.government_id_last4) : null,
		kycStatus: row.kyc_status,
		kycRejectReason: row.kyc_reject_reason ? String(row.kyc_reject_reason) : null,
		riderType: row.rider_type,
		vehicleType: row.vehicle_type,
		vehicleRegistration: row.vehicle_registration ? String(row.vehicle_registration) : null,
		licenceNumber: row.licence_number ? String(row.licence_number) : null,
		insuranceRef: row.insurance_ref ? String(row.insurance_ref) : null,
		payoutUpi: row.payout_upi ? String(row.payout_upi) : null,
		payoutBankLast4: row.payout_bank_last4 ? String(row.payout_bank_last4) : null,
		preferredZones: json(row.preferred_zones, []),
		availabilityNotes: String(row.availability_notes ?? ""),
		status: row.status,
		onlineSince: row.online_since ? iso(row.online_since) : null,
		locale: row.locale ?? "en",
		createdAt: iso(row.created_at),
		updatedAt: iso(row.updated_at),
		dataMode: row.data_mode ?? "SIMULATED"
	};
}
var PgStore = class {
	sql;
	constructor(sql) {
		this.sql = sql;
	}
	async getConfig() {
		const rows = await this.sql.query("select payload from platform_config where id = $1", ["default"]);
		if (!rows[0]) {
			await this.saveConfig(DEFAULT_CONFIG);
			return structuredClone(DEFAULT_CONFIG);
		}
		return {
			...DEFAULT_CONFIG,
			...json(rows[0].payload, DEFAULT_CONFIG)
		};
	}
	async saveConfig(cfg) {
		await this.sql.query(`insert into platform_config (id, payload, updated_at)
       values ($1, $2::jsonb, now())
       on conflict (id) do update set payload = excluded.payload, updated_at = now()`, ["default", JSON.stringify(cfg)]);
	}
	async getRiderByUserId(userId) {
		const rows = await this.sql.query("select * from riders where user_id = $1", [userId]);
		return rows[0] ? riderFromRow(rows[0]) : null;
	}
	async getRiderById(id) {
		const rows = await this.sql.query("select * from riders where id = $1", [id]);
		return rows[0] ? riderFromRow(rows[0]) : null;
	}
	async upsertRider(r) {
		await this.sql.query(`insert into riders (
        id, user_id, full_name, phone, email, photo_url, address,
        emergency_name, emergency_phone, date_of_birth, government_id_type,
        government_id_last4, kyc_status, kyc_reject_reason, rider_type,
        vehicle_type, vehicle_registration, licence_number, insurance_ref,
        payout_upi, payout_bank_last4, preferred_zones, availability_notes,
        status, online_since, locale, created_at, updated_at, data_mode
      ) values (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29
      )
      on conflict (id) do update set
        full_name = excluded.full_name, phone = excluded.phone, email = excluded.email,
        photo_url = excluded.photo_url, address = excluded.address,
        emergency_name = excluded.emergency_name, emergency_phone = excluded.emergency_phone,
        date_of_birth = excluded.date_of_birth, government_id_type = excluded.government_id_type,
        government_id_last4 = excluded.government_id_last4, kyc_status = excluded.kyc_status,
        kyc_reject_reason = excluded.kyc_reject_reason, rider_type = excluded.rider_type,
        vehicle_type = excluded.vehicle_type, vehicle_registration = excluded.vehicle_registration,
        licence_number = excluded.licence_number, insurance_ref = excluded.insurance_ref,
        payout_upi = excluded.payout_upi, payout_bank_last4 = excluded.payout_bank_last4,
        preferred_zones = excluded.preferred_zones, availability_notes = excluded.availability_notes,
        status = excluded.status, online_since = excluded.online_since, locale = excluded.locale,
        updated_at = excluded.updated_at`, [
			r.id,
			r.userId,
			r.fullName,
			r.phone,
			r.email,
			r.photoUrl,
			r.address,
			r.emergencyName,
			r.emergencyPhone,
			r.dateOfBirth,
			r.governmentIdType,
			r.governmentIdLast4,
			r.kycStatus,
			r.kycRejectReason,
			r.riderType,
			r.vehicleType,
			r.vehicleRegistration,
			r.licenceNumber,
			r.insuranceRef,
			r.payoutUpi,
			r.payoutBankLast4,
			JSON.stringify(r.preferredZones),
			r.availabilityNotes,
			r.status,
			r.onlineSince,
			r.locale,
			r.createdAt,
			r.updatedAt,
			r.dataMode
		]);
	}
	async getOpenOfferForRider(riderId) {
		const rows = await this.sql.query("select * from dispatch_offers where rider_id = $1 and status = 'OPEN' order by created_at desc limit 1", [riderId]);
		return rows[0] ? offerFromRow(rows[0]) : null;
	}
	async getOfferById(id) {
		const rows = await this.sql.query("select * from dispatch_offers where id = $1", [id]);
		return rows[0] ? offerFromRow(rows[0]) : null;
	}
	async insertOffer(offer, userId) {
		await this.sql.query(`insert into dispatch_offers (id, rider_id, user_id, order_code, payload, status, expires_at, created_at, data_mode)
       values ($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9)`, [
			offer.id,
			offer.riderId,
			userId,
			offer.orderCode,
			JSON.stringify(offer),
			offer.status,
			offer.expiresAt,
			offer.createdAt,
			offer.dataMode
		]);
	}
	async updateOffer(offer) {
		await this.sql.query(`update dispatch_offers set status = $2, payload = $3::jsonb where id = $1`, [
			offer.id,
			offer.status,
			JSON.stringify(offer)
		]);
		return true;
	}
	async getActiveDeliveryForRider(riderId) {
		const rows = await this.sql.query(`select * from deliveries
       where rider_id = $1
         and state not in ('DELIVERED','OFFER_EXPIRED','RIDER_DECLINED','RIDER_CANCELLED','DELIVERY_FAILED','ORDER_CANCELLED','OFFERED')
       order by created_at desc limit 1`, [riderId]);
		return rows[0] ? deliveryFromRow(rows[0]) : null;
	}
	async getDeliveryById(id) {
		const rows = await this.sql.query("select * from deliveries where id = $1", [id]);
		return rows[0] ? deliveryFromRow(rows[0]) : null;
	}
	async listDeliveriesForUser(userId, range) {
		return (range ? await this.sql.query(`select * from deliveries where user_id = $1 and created_at >= $2 and created_at <= $3 order by created_at desc`, [
			userId,
			range.from,
			range.to
		]) : await this.sql.query(`select * from deliveries where user_id = $1 order by created_at desc`, [userId])).map(deliveryFromRow);
	}
	async insertDelivery(d) {
		await this.sql.query(`insert into deliveries (id, offer_id, rider_id, user_id, order_id, order_code, state, payload, created_at, updated_at, data_mode)
       values ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10,$11)`, [
			d.id,
			d.offerId,
			d.riderId,
			d.userId,
			d.orderId,
			d.orderCode,
			d.state,
			JSON.stringify(d),
			d.createdAt,
			d.updatedAt,
			d.dataMode
		]);
	}
	async updateDelivery(d) {
		await this.sql.query(`update deliveries set state = $2, payload = $3::jsonb, updated_at = $4 where id = $1 and user_id = $5`, [
			d.id,
			d.state,
			JSON.stringify(d),
			d.updatedAt,
			d.userId
		]);
	}
	async insertEvent(e, userId) {
		await this.sql.query(`insert into delivery_events (id, delivery_id, user_id, previous_state, new_state, actor, actor_id, reason, at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [
			e.id,
			e.deliveryId,
			userId,
			e.previousState,
			e.newState,
			e.actor,
			e.actorId,
			e.reason,
			e.at
		]);
	}
	async listEvents(deliveryId) {
		return (await this.sql.query("select * from delivery_events where delivery_id = $1 order by at", [deliveryId])).map((r) => ({
			id: String(r.id),
			deliveryId: String(r.delivery_id),
			previousState: r.previous_state ?? null,
			newState: r.new_state,
			actor: r.actor,
			actorId: String(r.actor_id),
			reason: r.reason ? String(r.reason) : null,
			at: iso(r.at)
		}));
	}
	async getOtp(deliveryId) {
		const r = (await this.sql.query("select * from delivery_otps where delivery_id = $1", [deliveryId]))[0];
		if (!r) return null;
		return {
			deliveryId: String(r.delivery_id),
			hash: String(r.hash),
			salt: String(r.salt),
			attempts: num(r.attempts),
			verifiedAt: r.verified_at ? iso(r.verified_at) : null,
			simulatedPlain: r.simulated_plain ? String(r.simulated_plain) : null
		};
	}
	async saveOtp(rec, userId) {
		await this.sql.query(`insert into delivery_otps (delivery_id, user_id, hash, salt, attempts, verified_at, simulated_plain)
       values ($1,$2,$3,$4,$5,$6,$7)
       on conflict (delivery_id) do update set
         attempts = excluded.attempts, verified_at = excluded.verified_at`, [
			rec.deliveryId,
			userId,
			rec.hash,
			rec.salt,
			rec.attempts,
			rec.verifiedAt,
			rec.simulatedPlain
		]);
	}
	async insertPod(p, userId) {
		await this.sql.query(`insert into proof_of_delivery (id, delivery_id, rider_id, user_id, method, photo_content_type, photo_bytes, photo_data_url, captured_at, data_mode)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, [
			p.id,
			p.deliveryId,
			p.riderId,
			userId,
			p.method,
			p.photoContentType,
			p.photoBytes,
			p.photoDataUrl,
			p.capturedAt,
			p.dataMode
		]);
	}
	async listPod(deliveryId) {
		return (await this.sql.query("select * from proof_of_delivery where delivery_id = $1", [deliveryId])).map((r) => ({
			id: String(r.id),
			deliveryId: String(r.delivery_id),
			riderId: String(r.rider_id),
			method: r.method,
			photoContentType: r.photo_content_type ? String(r.photo_content_type) : null,
			photoBytes: r.photo_bytes == null ? null : num(r.photo_bytes),
			photoDataUrl: r.photo_data_url ? String(r.photo_data_url) : null,
			capturedAt: iso(r.captured_at),
			dataMode: r.data_mode ?? "SIMULATED"
		}));
	}
	async getCash(deliveryId) {
		const r = (await this.sql.query("select * from cash_reconciliation where delivery_id = $1", [deliveryId]))[0];
		if (!r) return null;
		return {
			deliveryId: String(r.delivery_id),
			riderId: String(r.rider_id),
			expectedPaise: num(r.expected_paise),
			collectedPaise: r.collected_paise == null ? null : num(r.collected_paise),
			state: r.state,
			exceptionReason: r.exception_reason ? String(r.exception_reason) : null,
			updatedAt: iso(r.updated_at)
		};
	}
	async saveCash(c, userId) {
		await this.sql.query(`insert into cash_reconciliation (delivery_id, rider_id, user_id, expected_paise, collected_paise, state, exception_reason, updated_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8)
       on conflict (delivery_id) do update set
         collected_paise = excluded.collected_paise, state = excluded.state,
         exception_reason = excluded.exception_reason, updated_at = excluded.updated_at`, [
			c.deliveryId,
			c.riderId,
			userId,
			c.expectedPaise,
			c.collectedPaise,
			c.state,
			c.exceptionReason,
			c.updatedAt
		]);
	}
	async appendEarning(line, userId) {
		await this.sql.query(`insert into rider_earnings (id, rider_id, user_id, delivery_id, order_code, kind, amount_paise, note, at, data_mode)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, [
			line.id,
			line.riderId,
			userId,
			line.deliveryId,
			line.orderCode,
			line.kind,
			line.amountPaise,
			line.note,
			line.at,
			line.dataMode
		]);
	}
	async listEarnings(userId, range) {
		return (range ? await this.sql.query(`select * from rider_earnings where user_id = $1 and at >= $2 and at <= $3 order by at desc`, [
			userId,
			range.from,
			range.to
		]) : await this.sql.query(`select * from rider_earnings where user_id = $1 order by at desc`, [userId])).map((r) => ({
			id: String(r.id),
			riderId: String(r.rider_id),
			deliveryId: r.delivery_id ? String(r.delivery_id) : null,
			orderCode: r.order_code ? String(r.order_code) : null,
			kind: r.kind,
			amountPaise: num(r.amount_paise),
			note: String(r.note ?? ""),
			at: iso(r.at),
			dataMode: r.data_mode ?? "SIMULATED"
		}));
	}
	async mutateEarning(_id) {
		throw new RiderError("EARNINGS_IMMUTABLE", "Historical earnings cannot be changed", 403);
	}
	async listSettlements(userId) {
		return (await this.sql.query("select * from settlement_lines where user_id = $1 order by period_end desc", [userId])).map((r) => ({
			id: String(r.id),
			riderId: String(r.rider_id),
			periodStart: String(r.period_start),
			periodEnd: String(r.period_end),
			amountPaise: num(r.amount_paise),
			status: r.status,
			confirmedPaidAt: r.confirmed_paid_at ? iso(r.confirmed_paid_at) : null,
			dataMode: r.data_mode ?? "SIMULATED"
		}));
	}
	async insertSettlement(s, userId) {
		await this.sql.query(`insert into settlement_lines (id, rider_id, user_id, period_start, period_end, amount_paise, status, confirmed_paid_at, data_mode)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [
			s.id,
			s.riderId,
			userId,
			s.periodStart,
			s.periodEnd,
			s.amountPaise,
			s.status,
			s.confirmedPaidAt,
			s.dataMode
		]);
	}
	async updateSettlementStatus(id, userId, status, confirmedPaidAt) {
		await this.sql.query(`update settlement_lines set status = $3, confirmed_paid_at = $4
       where id = $1 and user_id = $2`, [
			id,
			userId,
			status,
			confirmedPaidAt
		]);
	}
	async insertTicket(t, userId) {
		await this.sql.query(`insert into support_tickets (id, rider_id, user_id, delivery_id, topic, message, status, created_at, updated_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [
			t.id,
			t.riderId,
			userId,
			t.deliveryId,
			t.topic,
			t.message,
			t.status,
			t.createdAt,
			t.updatedAt
		]);
	}
	async listTickets(userId) {
		return (await this.sql.query("select * from support_tickets where user_id = $1 order by created_at desc", [userId])).map((r) => ({
			id: String(r.id),
			riderId: String(r.rider_id),
			deliveryId: r.delivery_id ? String(r.delivery_id) : null,
			topic: r.topic,
			message: String(r.message),
			status: r.status,
			createdAt: iso(r.created_at),
			updatedAt: iso(r.updated_at)
		}));
	}
	async insertSafety(s, userId) {
		await this.sql.query(`insert into safety_incidents (id, rider_id, user_id, delivery_id, kind, note, lat, lng, created_at, emergency_dispatched)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, [
			s.id,
			s.riderId,
			userId,
			s.deliveryId,
			s.kind,
			s.note,
			s.location?.lat ?? null,
			s.location?.lng ?? null,
			s.createdAt,
			false
		]);
	}
	async listSafety(userId) {
		return (await this.sql.query("select * from safety_incidents where user_id = $1 order by created_at desc", [userId])).map((r) => ({
			id: String(r.id),
			riderId: String(r.rider_id),
			deliveryId: r.delivery_id ? String(r.delivery_id) : null,
			kind: r.kind,
			note: String(r.note ?? ""),
			location: r.lat == null || r.lng == null ? null : {
				lat: num(r.lat),
				lng: num(r.lng)
			},
			createdAt: iso(r.created_at),
			emergencyDispatched: false
		}));
	}
	async insertNotification(n) {
		await this.sql.query(`insert into notifications (id, user_id, title, body, kind, read, created_at)
       values ($1,$2,$3,$4,$5,$6,$7)`, [
			n.id,
			n.userId,
			n.title,
			n.body,
			n.kind,
			n.read,
			n.createdAt
		]);
	}
	async listNotifications(userId) {
		return (await this.sql.query("select * from notifications where user_id = $1 order by created_at desc limit 40", [userId])).map((r) => ({
			id: String(r.id),
			userId: String(r.user_id),
			title: String(r.title),
			body: String(r.body),
			kind: r.kind,
			read: Boolean(r.read),
			createdAt: iso(r.created_at)
		}));
	}
	async appendAudit(a) {
		await this.sql.query(`insert into audit_logs (id, actor_id, action, resource, resource_id, at, meta)
       values ($1,$2,$3,$4,$5,$6,$7)`, [
			a.id,
			a.actorId,
			a.action,
			a.resource,
			a.resourceId,
			a.at,
			a.meta
		]);
	}
	async insertSignal(s, userId) {
		await this.sql.query(`insert into fraud_signals (id, rider_id, user_id, delivery_id, kind, detail, stage, created_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8)`, [
			s.id,
			s.riderId,
			userId,
			s.deliveryId,
			s.kind,
			s.detail,
			s.stage,
			s.createdAt
		]);
	}
	async getIdempotency(userId, key) {
		const r = (await this.sql.query("select * from idempotency_keys where user_id = $1 and key = $2", [userId, key]))[0];
		if (!r) return null;
		return {
			userId: String(r.user_id),
			key: String(r.key),
			action: String(r.action),
			resourceId: String(r.resource_id),
			responseJson: String(r.response_json),
			createdAt: iso(r.created_at)
		};
	}
	async saveIdempotency(r) {
		await this.sql.query(`insert into idempotency_keys (user_id, key, action, resource_id, response_json, created_at)
       values ($1,$2,$3,$4,$5,$6)
       on conflict (user_id, key) do nothing`, [
			r.userId,
			r.key,
			r.action,
			r.resourceId,
			r.responseJson,
			r.createdAt
		]);
	}
	async insertLocation(p, userId) {
		await this.sql.query(`insert into location_pings (id, rider_id, user_id, delivery_id, lat, lng, accuracy_m, at)
       values ($1,$2,$3,$4,$5,$6,$7,$8)`, [
			p.id,
			p.riderId,
			userId,
			p.deliveryId,
			p.point.lat,
			p.point.lng,
			p.accuracyM,
			p.at
		]);
	}
	async pruneLocations(userId, keepAfterIso, maxRows) {
		await this.sql.query(`delete from location_pings where user_id = $1 and at < $2`, [userId, keepAfterIso]);
		await this.sql.query(`delete from location_pings where id in (
         select id from location_pings where user_id = $1
         order by at desc offset $2
       )`, [userId, maxRows]);
	}
	async latestLocation(userId) {
		const r = (await this.sql.query("select * from location_pings where user_id = $1 order by at desc limit 1", [userId]))[0];
		if (!r) return null;
		return {
			id: String(r.id),
			riderId: String(r.rider_id),
			deliveryId: r.delivery_id ? String(r.delivery_id) : null,
			point: {
				lat: num(r.lat),
				lng: num(r.lng)
			},
			accuracyM: r.accuracy_m == null ? null : num(r.accuracy_m),
			at: iso(r.at)
		};
	}
	async hitRateLimit(userId, action, windowMs, max) {
		const since = new Date(Date.now() - windowMs).toISOString();
		const rows = await this.sql.query(`select count(*)::int as n from rate_limit_hits where user_id = $1 and action = $2 and at >= $3`, [
			userId,
			action,
			since
		]);
		await this.sql.query(`insert into rate_limit_hits (user_id, action, at) values ($1,$2,now())`, [userId, action]);
		return num(rows[0]?.n) >= max;
	}
};
function offerFromRow(row) {
	return {
		...json(row.payload, {}),
		id: String(row.id),
		riderId: String(row.rider_id),
		orderCode: String(row.order_code),
		status: row.status,
		expiresAt: iso(row.expires_at),
		createdAt: iso(row.created_at),
		dataMode: row.data_mode ?? "SIMULATED"
	};
}
function deliveryFromRow(row) {
	return {
		...json(row.payload, {}),
		id: String(row.id),
		offerId: String(row.offer_id),
		riderId: String(row.rider_id),
		userId: String(row.user_id),
		orderId: String(row.order_id),
		orderCode: String(row.order_code),
		state: row.state,
		createdAt: iso(row.created_at),
		updatedAt: iso(row.updated_at),
		dataMode: row.data_mode ?? "SIMULATED"
	};
}
//#endregion
export { rangePreset as i, RiderEngine as n, RiderError as r, PgStore as t };
