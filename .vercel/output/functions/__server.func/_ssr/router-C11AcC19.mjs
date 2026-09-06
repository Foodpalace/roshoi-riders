import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { B as redirect, S as require_jsx_runtime, _ as createFileRoute, d as HeadContent, g as lazyRouteComponent, h as Outlet, m as createRouter, u as Scripts, v as createRootRoute, x as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn, s as __exportAll } from "./ssr.mjs";
import { L as string, N as number, P as object, R as union, j as literal } from "../_libs/@better-auth/core+[...].mjs";
import { n as auth } from "./server-CeCJAsrv.mjs";
import { t as DEFAULT_BRANDING } from "./config-BVkxo9ab.mjs";
import { n as TriangleAlert } from "../_libs/lucide-react.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-C11AcC19.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: error.message || "An unexpected error occurred. Try reloading the page."
			})
		]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	if (typeof window === "undefined") return () => {};
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	const parentOrigin = resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		if (envelope.data.type === "hello") {
			if (!HelloSchema.safeParse(event.data).success) return;
			announce();
			return;
		}
		if (envelope.data.type === "navigate") {
			const parsed = NavigateSchema.safeParse(event.data);
			if (!parsed.success) return;
			navigate(parsed.data.path);
			queueMicrotask(reportLocation);
			return;
		}
		if (envelope.data.type === "history") {
			const parsed = HistorySchema.safeParse(event.data);
			if (!parsed.success) return;
			if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
			window.history.go(parsed.data.delta);
		}
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var STRINGS = {
	en: {
		brandTag: "Partner",
		simulated: "SIMULATED",
		simulatedBanner: "Simulated operations — not live dispatch, GPS, payouts, or real customers.",
		signIn: "Sign in",
		signUp: "Create account",
		continueGoogle: "Continue with Google",
		continueX: "Continue with X",
		email: "Email",
		password: "Password",
		name: "Full name",
		or: "or",
		goOnline: "Go online",
		goOffline: "Go offline",
		confirmOffline: "Go offline now?",
		confirmOfflineBody: "You will stop receiving delivery offers. Any active delivery must still be finished.",
		cancel: "Cancel",
		confirm: "Confirm",
		offline: "Offline",
		online: "Online",
		busy: "Busy",
		todayEarnings: "Today",
		completed: "Completed",
		onlineFor: "Online",
		pendingCash: "Cash to deposit",
		currentDelivery: "Current delivery",
		offers: "Offers",
		noOffers: "No offers right now. Stay online.",
		accept: "Accept",
		decline: "Decline",
		offerExpired: "Offer expired",
		imAtRestaurant: "I'm at the restaurant",
		pickUp: "Pick up order",
		startDelivery: "Start delivery",
		iveArrived: "I've arrived",
		collectCash: "Collect",
		cashCollected: "Cash collected",
		enterOtp: "Delivery OTP",
		confirmDelivered: "Confirm delivered",
		photoPod: "Photo proof",
		navigate: "Navigate",
		earnings: "Earnings",
		history: "History",
		settlements: "Settlements",
		support: "Support",
		safety: "Safety",
		profile: "Profile",
		assistant: "Assistant",
		home: "Home",
		kyc: "Verification",
		vehicle: "Vehicle",
		submitKyc: "Submit for review",
		underReview: "Under review — you are not fully approved yet.",
		rejected: "Verification rejected",
		verified: "Verified",
		draft: "Draft",
		connectionLost: "Connection lost",
		connectionLostBody: "Your connection was interrupted. We haven't confirmed the action yet. Please try again.",
		locationUnavailable: "Location temporarily unavailable",
		retry: "Try again",
		today: "Today",
		yesterday: "Yesterday",
		thisWeek: "This week",
		thisMonth: "This month",
		netPayable: "Net payable",
		payout: "Delivery payout",
		incentive: "Incentive",
		adjustment: "Adjustment",
		deduction: "Deduction",
		cashCollectedLabel: "Cash collected",
		cashReconciled: "Cash reconciled",
		payable: "Payable",
		processing: "Processing",
		paid: "Paid",
		failed: "Failed",
		onHold: "On hold",
		disputed: "Disputed",
		estimated: "Estimated",
		live: "Live",
		packages: "Packages",
		order: "Order",
		cod: "Cash on delivery",
		restaurantNotReady: "Restaurant not ready",
		customerUnavailable: "Customer not available",
		cancelDelivery: "Cancel assignment",
		waitTimer: "Waiting",
		contactAttempt: "Record contact attempt",
		askAssistant: "Ask about your shift",
		send: "Send",
		emergency: "Emergency services",
		emergencyNote: "This opens a phone call. We do not dispatch emergency services automatically.",
		shareLocation: "Share my location",
		reportUnsafe: "Report unsafe situation",
		newTicket: "New ticket",
		ticketRef: "Ticket",
		declineReason: "Reason (optional)",
		cancelReason: "Why are you cancelling?",
		vehicleProblem: "Vehicle problem",
		safetyIssue: "Safety issue",
		wrongAssignment: "Wrong assignment",
		restaurantIssue: "Restaurant issue",
		customerIssue: "Customer issue",
		other: "Other",
		save: "Save",
		next: "Next",
		back: "Back",
		phone: "Phone",
		address: "Address",
		emergencyContact: "Emergency contact",
		dob: "Date of birth",
		govId: "Government ID last 4",
		vehicleType: "Vehicle",
		registration: "Registration",
		licence: "Licence number",
		insurance: "Insurance reference",
		upi: "UPI payout ID",
		zones: "Preferred zones",
		availability: "Availability notes",
		photo: "Profile photo URL",
		welcome: "Ready when you are.",
		practiceMode: "Practice / simulation is available while verification is in progress.",
		alerts: "Alerts",
		noAlerts: "No alerts",
		performance: "Performance",
		acceptanceRate: "Acceptance",
		cancelRate: "Cancellations",
		onTime: "On-time pickup",
		successRate: "Successful delivery",
		perOrder: "Per order",
		notifications: "Notifications",
		language: "Language",
		signOut: "Sign out",
		otpWrong: "That code does not match. Try again.",
		otpLocked: "Too many attempts. Support has been notified.",
		cannotEditCash: "The cash amount comes from the order. You cannot change it.",
		actionNotConfirmed: "We have not confirmed this yet.",
		pickupCode: "Pickup code",
		specialHandling: "Special handling",
		dropArea: "Drop area",
		expectedPayout: "Expected payout",
		distance: "Distance",
		route: "Route",
		expiresIn: "Expires in",
		steps: "Stops",
		stopN: "Stop",
		aiUnavailable: "The assistant is not available right now.",
		aiDriving: "Keep the phone mounted. Ask only when it is safe to stop.",
		createTicket: "Create ticket",
		message: "Message",
		open: "Open",
		inProgress: "In progress",
		resolved: "Resolved",
		closed: "Closed",
		statement: "Statement",
		customRange: "Custom range",
		noHistory: "No deliveries in this period.",
		kycHint: "Unverified partners cannot take live orders. Simulation is labelled.",
		legalNote: "Partner classification is operational, not a legal employment status.",
		mapsOpen: "Open in maps",
		uploadPhoto: "Add photo",
		waitingRestaurant: "Waiting for food",
		arrived: "Arrived",
		pickedUp: "Picked up",
		onTheWay: "On the way",
		delivered: "Delivered",
		passwordHint: "At least 8 characters",
		haveAccount: "Already have an account?",
		needAccount: "Need an account?",
		loginLead: "Sign in to go on duty.",
		homeEmpty: "Go online to receive offers.",
		confirmGoOnline: "Go online?",
		confirmGoOnlineBody: "We will use your location only while you are online or on an active delivery.",
		stayOffline: "Stay offline",
		stayOnline: "Stay online",
		declineConfirm: "Decline this offer?",
		reasonRequired: "Please choose a reason",
		simOtpHint: "SIMULATION — the customer would tell you this code.",
		cashMustMatch: "Collect exactly this amount. Do not edit it.",
		idempotentOk: "Already recorded.",
		unauthorized: "Please sign in to continue.",
		forbidden: "You cannot access that.",
		orderCancelled: "This order was cancelled. Do not deliver it.",
		offerGone: "This offer is no longer available."
	},
	bn: {
		brandTag: "পার্টনার",
		simulated: "সিমুলেটেড",
		simulatedBanner: "সিমুলেটেড অপারেশন — লাইভ ডিসপ্যাচ, জিপিএস, পেআউট বা আসল গ্রাহক নয়।",
		signIn: "সাইন ইন",
		signUp: "অ্যাকাউন্ট তৈরি",
		continueGoogle: "Google দিয়ে চালিয়ে যান",
		continueX: "X দিয়ে চালিয়ে যান",
		email: "ইমেইল",
		password: "পাসওয়ার্ড",
		name: "পুরো নাম",
		or: "অথবা",
		goOnline: "অনলাইন হোন",
		goOffline: "অফলাইন হোন",
		confirmOffline: "এখন অফলাইন হবেন?",
		confirmOfflineBody: "আপনি আর অফার পাবেন না। চলমান ডেলিভারি শেষ করতে হবে।",
		cancel: "বাতিল",
		confirm: "নিশ্চিত",
		offline: "অফলাইন",
		online: "অনলাইন",
		busy: "ব্যস্ত",
		todayEarnings: "আজ",
		completed: "সম্পন্ন",
		onlineFor: "অনলাইন",
		pendingCash: "জমা দেওয়ার নগদ",
		currentDelivery: "চলমান ডেলিভারি",
		offers: "অফার",
		noOffers: "এখন কোনো অফার নেই। অনলাইনে থাকুন।",
		accept: "গ্রহণ",
		decline: "প্রত্যাখ্যান",
		offerExpired: "অফারের সময় শেষ",
		imAtRestaurant: "রেস্তোরাঁয় পৌঁছেছি",
		pickUp: "অর্ডার তুলুন",
		startDelivery: "ডেলিভারি শুরু",
		iveArrived: "পৌঁছে গেছি",
		collectCash: "নিন",
		cashCollected: "নগদ নেওয়া হয়েছে",
		enterOtp: "ডেলিভারি ওটিপি",
		confirmDelivered: "ডেলিভারি নিশ্চিত",
		photoPod: "ছবির প্রমাণ",
		navigate: "নেভিগেট",
		earnings: "আয়",
		history: "ইতিহাস",
		settlements: "সেটেলমেন্ট",
		support: "সহায়তা",
		safety: "নিরাপত্তা",
		profile: "প্রোফাইল",
		assistant: "সহায়ক",
		home: "হোম",
		kyc: "যাচাই",
		vehicle: "যানবাহন",
		submitKyc: "রিভিউয়ের জন্য পাঠান",
		underReview: "রিভিউ চলছে — আপনি এখনও সম্পূর্ণ অনুমোদিত নন।",
		rejected: "যাচাই প্রত্যাখ্যাত",
		verified: "যাচাইকৃত",
		draft: "খসড়া",
		connectionLost: "সংযোগ নেই",
		connectionLostBody: "সংযোগ বিচ্ছিন্ন হয়েছে। কাজটি এখনও নিশ্চিত হয়নি। আবার চেষ্টা করুন।",
		locationUnavailable: "লোকেশন সাময়িকভাবে পাওয়া যাচ্ছে না",
		retry: "আবার চেষ্টা",
		today: "আজ",
		yesterday: "গতকাল",
		thisWeek: "এই সপ্তাহ",
		thisMonth: "এই মাস",
		netPayable: "নেট প্রদেয়",
		payout: "ডেলিভারি পেআউট",
		incentive: "ইনসেন্টিভ",
		adjustment: "সমন্বয়",
		deduction: "কর্তন",
		cashCollectedLabel: "নগদ সংগ্রহ",
		cashReconciled: "নগদ মিলানো",
		payable: "প্রদেয়",
		processing: "প্রক্রিয়াধীন",
		paid: "পরিশোধিত",
		failed: "ব্যর্থ",
		onHold: "স্থগিত",
		disputed: "বিতর্কিত",
		estimated: "আনুমানিক",
		live: "লাইভ",
		packages: "প্যাকেজ",
		order: "অর্ডার",
		cod: "ক্যাশ অন ডেলিভারি",
		restaurantNotReady: "খাবার তৈরি নয়",
		customerUnavailable: "গ্রাহক পাওয়া যায়নি",
		cancelDelivery: "অ্যাসাইনমেন্ট বাতিল",
		waitTimer: "অপেক্ষা",
		contactAttempt: "যোগাযোগের চেষ্টা রেকর্ড",
		askAssistant: "শিফট নিয়ে জিজ্ঞাসা করুন",
		send: "পাঠান",
		emergency: "জরুরি পরিষেবা",
		emergencyNote: "এটি একটি ফোন কল খুলবে। আমরা স্বয়ংক্রিয়ভাবে জরুরি পরিষেবা পাঠাই না।",
		shareLocation: "আমার লোকেশন শেয়ার",
		reportUnsafe: "অনিরাপদ পরিস্থিতি জানান",
		newTicket: "নতুন টিকিট",
		ticketRef: "টিকিট",
		declineReason: "কারণ (ঐচ্ছিক)",
		cancelReason: "কেন বাতিল করছেন?",
		vehicleProblem: "যানবাহনের সমস্যা",
		safetyIssue: "নিরাপত্তা সমস্যা",
		wrongAssignment: "ভুল অ্যাসাইনমেন্ট",
		restaurantIssue: "রেস্তোরাঁর সমস্যা",
		customerIssue: "গ্রাহকের সমস্যা",
		other: "অন্যান্য",
		save: "সংরক্ষণ",
		next: "পরবর্তী",
		back: "পিছনে",
		phone: "ফোন",
		address: "ঠিকানা",
		emergencyContact: "জরুরি যোগাযোগ",
		dob: "জন্ম তারিখ",
		govId: "সরকারি পরিচয়ের শেষ ৪",
		vehicleType: "যানবাহন",
		registration: "রেজিস্ট্রেশন",
		licence: "লাইসেন্স নম্বর",
		insurance: "বীমার রেফারেন্স",
		upi: "UPI পেআউট আইডি",
		zones: "পছন্দের জোন",
		availability: "উপলব্ধতার নোট",
		photo: "প্রোফাইল ছবি URL",
		welcome: "প্রস্তুত হলে শুরু করুন।",
		practiceMode: "যাচাই চলাকালীন অনুশীলন/সিমুলেশন ব্যবহার করা যাবে।",
		alerts: "সতর্কতা",
		noAlerts: "কোনো সতর্কতা নেই",
		performance: "পারফরম্যান্স",
		acceptanceRate: "গ্রহণের হার",
		cancelRate: "বাতিল",
		onTime: "সময়মতো পিকআপ",
		successRate: "সফল ডেলিভারি",
		perOrder: "প্রতি অর্ডার",
		notifications: "নোটিফিকেশন",
		language: "ভাষা",
		signOut: "সাইন আউট",
		otpWrong: "কোড মিলছে না। আবার চেষ্টা করুন।",
		otpLocked: "অনেকবার ভুল। সহায়তাকে জানানো হয়েছে।",
		cannotEditCash: "নগদের পরিমাণ অর্ডার থেকে আসে। আপনি বদলাতে পারবেন না।",
		actionNotConfirmed: "এটি এখনও নিশ্চিত হয়নি।",
		pickupCode: "পিকআপ কোড",
		specialHandling: "বিশেষ নির্দেশ",
		dropArea: "ড্রপ এলাকা",
		expectedPayout: "প্রত্যাশিত পেআউট",
		distance: "দূরত্ব",
		route: "রুট",
		expiresIn: "মেয়াদ",
		steps: "স্টপ",
		stopN: "স্টপ",
		aiUnavailable: "সহায়ক এখন পাওয়া যাচ্ছে না।",
		aiDriving: "ফোন মাউন্টে রাখুন। থেমে নিরাপদ হলেই জিজ্ঞাসা করুন।",
		createTicket: "টিকিট খুলুন",
		message: "বার্তা",
		open: "খোলা",
		inProgress: "চলছে",
		resolved: "সমাধান",
		closed: "বন্ধ",
		statement: "স্টেটমেন্ট",
		customRange: "নিজস্ব তারিখ",
		noHistory: "এই সময়ে কোনো ডেলিভারি নেই।",
		kycHint: "অযাচাইকৃত পার্টনার লাইভ অর্ডার নিতে পারেন না। সিমুলেশন চিহ্নিত।",
		legalNote: "পার্টনার শ্রেণি অপারেশনাল, আইনি চাকরির মর্যাদা নয়।",
		mapsOpen: "ম্যাপে খুলুন",
		uploadPhoto: "ছবি যোগ",
		waitingRestaurant: "খাবারের অপেক্ষা",
		arrived: "পৌঁছেছেন",
		pickedUp: "তুলেছেন",
		onTheWay: "পথে",
		delivered: "পৌঁছে দিয়েছেন",
		passwordHint: "কমপক্ষে ৮ অক্ষর",
		haveAccount: "অ্যাকাউন্ট আছে?",
		needAccount: "অ্যাকাউন্ট দরকার?",
		loginLead: "ডিউটিতে যেতে সাইন ইন করুন।",
		homeEmpty: "অফার পেতে অনলাইন হোন।",
		confirmGoOnline: "অনলাইন হবেন?",
		confirmGoOnlineBody: "আপনি অনলাইন বা সক্রিয় ডেলিভারিতে থাকলেই লোকেশন ব্যবহার হবে।",
		stayOffline: "অফলাইনে থাকুন",
		stayOnline: "অনলাইনে থাকুন",
		declineConfirm: "এই অফার প্রত্যাখ্যান করবেন?",
		reasonRequired: "একটি কারণ বেছে নিন",
		simOtpHint: "সিমুলেশন — প্রোডাকশনে গ্রাহক এই কোড বলবেন।",
		cashMustMatch: "ঠিক এই পরিমাণ নিন। পরিবর্তন করবেন না।",
		idempotentOk: "আগেই রেকর্ড হয়েছে।",
		unauthorized: "চালিয়ে যেতে সাইন ইন করুন।",
		forbidden: "এটি দেখার অনুমতি নেই।",
		orderCancelled: "অর্ডার বাতিল। ডেলিভারি করবেন না।",
		offerGone: "এই অফার আর নেই।"
	}
};
var FALLBACK = {
	en: "en",
	bn: "bn",
	as: "en",
	hi: "en"
};
function t(locale, key) {
	return STRINGS[FALLBACK[locale]][key] ?? STRINGS.en[key];
}
var LOCALE_LABELS = {
	en: "English",
	bn: "বাংলা",
	as: "অসমীয়া",
	hi: "हिन्दी"
};
var KEY = "roshoi.locale";
function readLocale() {
	if (typeof window === "undefined") return "en";
	const v = window.localStorage.getItem(KEY);
	if (v === "bn" || v === "en" || v === "as" || v === "hi") return v;
	return "en";
}
var Ctx = (0, import_react.createContext)({
	locale: "en",
	t: (k) => t("en", k),
	setLocale: () => void 0
});
function I18nProvider({ children }) {
	const [locale, setLocaleState] = (0, import_react.useState)("en");
	(0, import_react.useEffect)(() => {
		setLocaleState(readLocale());
	}, []);
	const value = (0, import_react.useMemo)(() => ({
		locale,
		t: (key) => t(locale, key),
		setLocale: (l) => {
			setLocaleState(l);
			try {
				window.localStorage.setItem(KEY, l);
			} catch {}
		}
	}), [locale]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ctx.Provider, {
		value,
		children
	});
}
function useI18n() {
	return (0, import_react.useContext)(Ctx);
}
var styles_default = "/assets/styles-CitQ-N6D.css";
var APP_NAME = DEFAULT_BRANDING.appName;
var fetchSessionUser = createServerFn({ method: "GET" }).handler(createSsrRpc("2c4985e96c199268f7f639534cb5e8e31d6b19d43286bf77416413db60ffde26"));
var Route$12 = createRootRoute({
	beforeLoad: async () => ({ sessionUser: await fetchSessionUser() }),
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{ title: APP_NAME },
			{
				name: "theme-color",
				content: DEFAULT_BRANDING.colors.primary
			},
			{
				name: "description",
				content: DEFAULT_BRANDING.tagline
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,400;0,500;0,600;0,700&family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "bg-bg text-fg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(I18nProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
					position: "top-center",
					richColors: false
				})] }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	})
});
var $$splitComponentImporter$10 = () => import("./routes-85Z1Ms85.mjs");
var Route$11 = createFileRoute("/")({
	beforeLoad: ({ context }) => {
		if (!context.sessionUser) throw redirect({ to: "/login" });
	},
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./assistant-CHNiMHuT.mjs");
var Route$10 = createFileRoute("/assistant")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("./earnings-MTfkI7EZ.mjs");
var Route$9 = createFileRoute("/earnings")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("./history-B1dioIuC.mjs");
var Route$8 = createFileRoute("/history")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./login-zHfNb-DL.mjs");
var Route$7 = createFileRoute("/login")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./onboarding-alYBe4D3.mjs");
var Route$6 = createFileRoute("/onboarding")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./profile-DD_icnpX.mjs");
var Route$5 = createFileRoute("/profile")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./safety-CJoOdfpi.mjs");
var Route$4 = createFileRoute("/safety")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./settlements-NUbJPh_c.mjs");
var Route$3 = createFileRoute("/settlements")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./support-_rzqTWLt.mjs");
var Route$2 = createFileRoute("/support")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./delivery._id-eMlTAsra.mjs");
var Route$1 = createFileRoute("/delivery/$id")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var Route = createFileRoute("/api/auth/$")({ server: { handlers: {
	GET: ({ request }) => auth.handler(request),
	POST: ({ request }) => auth.handler(request)
} } });
var rootRouteChildren = {
	IndexRoute: Route$11.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$12
	}),
	AssistantRoute: Route$10.update({
		id: "/assistant",
		path: "/assistant",
		getParentRoute: () => Route$12
	}),
	EarningsRoute: Route$9.update({
		id: "/earnings",
		path: "/earnings",
		getParentRoute: () => Route$12
	}),
	HistoryRoute: Route$8.update({
		id: "/history",
		path: "/history",
		getParentRoute: () => Route$12
	}),
	LoginRoute: Route$7.update({
		id: "/login",
		path: "/login",
		getParentRoute: () => Route$12
	}),
	OnboardingRoute: Route$6.update({
		id: "/onboarding",
		path: "/onboarding",
		getParentRoute: () => Route$12
	}),
	ProfileRoute: Route$5.update({
		id: "/profile",
		path: "/profile",
		getParentRoute: () => Route$12
	}),
	SafetyRoute: Route$4.update({
		id: "/safety",
		path: "/safety",
		getParentRoute: () => Route$12
	}),
	SettlementsRoute: Route$3.update({
		id: "/settlements",
		path: "/settlements",
		getParentRoute: () => Route$12
	}),
	SupportRoute: Route$2.update({
		id: "/support",
		path: "/support",
		getParentRoute: () => Route$12
	}),
	DeliveryIdRoute: Route$1.update({
		id: "/delivery/$id",
		path: "/delivery/$id",
		getParentRoute: () => Route$12
	}),
	ApiAuthSplatRoute: Route.update({
		id: "/api/auth/$",
		path: "/api/auth/$",
		getParentRoute: () => Route$12
	})
};
var routeTree = Route$12._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { createSsrRpc as a, LOCALE_LABELS as i, Route$1 as n, useI18n as r, router_exports as t };
