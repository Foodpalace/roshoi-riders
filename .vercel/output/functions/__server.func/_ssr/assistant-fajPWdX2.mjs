import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as authMiddleware } from "./middleware-ipdYAC2x.mjs";
import { r as getSql } from "./db-CnKZuPEv.mjs";
import { n as RiderEngine, t as PgStore } from "./pg-store-DFSvL7A2.mjs";
import { t as formatPaise } from "./money-CIlgHPun.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/assistant-fajPWdX2.js
var POLICY = `You are the Roshoi Rider assistant. You may ONLY use the authorized snapshot JSON provided. Never invent earnings, payouts, addresses, OTPs, customer names, or order states. If a number is missing, say you do not have it. Never encourage speeding, phone use while riding, ignoring traffic law, or skipping safety steps. If the rider is BUSY or on an active delivery, keep answers short. Data is SIMULATED unless dataMode is LIVE. Answer in the rider's language if obvious, else English.`;
var askAssistantFn_createServerFn_handler = createServerRpc({
	id: "5464e230ddd90032ba9d794da765af160a9d1cebb36d9bdbb977f5bcbbca85fc",
	name: "askAssistantFn",
	filename: "src/lib/server/assistant.ts"
}, (opts) => askAssistantFn.__executeServer(opts));
var askAssistantFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(askAssistantFn_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const eng = new RiderEngine(new PgStore(sql));
	await eng.ensureRider({ id: context.userId });
	const snapshot = await eng.snapshotForAssistant(context.userId);
	const apiKey = process.env.XAI_API_KEY;
	const facts = JSON.stringify(snapshot);
	const question = data.question.slice(0, 500);
	if (!apiKey) return {
		ok: true,
		text: localAnswer(question, snapshot, data.busy)
	};
	try {
		const res = await fetch("https://api.x.ai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: "grok-4.5",
				max_tokens: data.busy ? 180 : 400,
				messages: [
					{
						role: "system",
						content: POLICY
					},
					{
						role: "system",
						content: `Authorized snapshot for user ${context.userId}: ${facts}`
					},
					{
						role: "user",
						content: question
					}
				]
			})
		});
		if (!res.ok) return {
			ok: true,
			text: localAnswer(question, snapshot, data.busy)
		};
		return {
			ok: true,
			text: (await res.json()).choices?.[0]?.message?.content?.trim() || localAnswer(question, snapshot, data.busy)
		};
	} catch {
		return {
			ok: true,
			text: localAnswer(question, snapshot, data.busy)
		};
	}
});
function localAnswer(q, s, busy) {
	const n = q.toLowerCase();
	const prefix = s.dataMode === "SIMULATED" ? "SIMULATED data. " : "";
	const short = busy ? "Keep the phone mounted if you are moving. " : "";
	if (n.includes("earn") || n.includes("payout") || n.includes("আয়") || n.includes("পেআউট")) return `${prefix}${short}Today's net is ${formatPaise(s.todayEarningsPaise)} across ${s.completedToday} completed deliveries. Payout ${formatPaise(s.payoutTotals.payout)}, incentives ${formatPaise(s.payoutTotals.incentive)}.`;
	if (n.includes("complet") || n.includes("how many") || n.includes("কত")) return `${prefix}${short}You completed ${s.completedToday} deliveries today.`;
	if (n.includes("current") || n.includes("where") || n.includes("order") || n.includes("অর্ডার")) {
		if (!s.currentDelivery) return `${prefix}${short}You do not have an active delivery.`;
		return `${prefix}${short}Order ${s.currentDelivery.orderCode} is ${s.currentDelivery.state.replaceAll("_", " ").toLowerCase()}. Pickup ${s.currentDelivery.restaurant}. Drop area ${s.currentDelivery.dropArea}.`;
	}
	if (n.includes("restaurant") || n.includes("ready") || n.includes("রেস্তোরাঁ")) return `${prefix}${short}If the restaurant is not ready: tap Restaurant not ready, wait, do not leave with the wrong bag, and pick up only with the order code. Do not speed to make up time.`;
	if (n.includes("customer") || n.includes("answer") || n.includes("unavailable") || n.includes("গ্রাহক")) return `${prefix}${short}If the customer does not answer: record a contact attempt, wait, then mark Customer not available and contact support. Never mark delivered without OTP.`;
	if (n.includes("histor")) return `${prefix}${short}${s.history.slice(0, 5).map((h) => `${h.orderCode} ${h.state} ${formatPaise(h.payoutPaise)}`).join("; ") || "No deliveries in this period."}`;
	return `${prefix}${short}I can explain today's earnings, your current order, pickup waits, or what to do if a customer is unavailable — using only your authorized snapshot.`;
}
//#endregion
export { askAssistantFn_createServerFn_handler };
