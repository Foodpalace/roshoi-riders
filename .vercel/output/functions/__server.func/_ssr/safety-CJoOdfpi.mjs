import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as DEFAULT_CONFIG } from "./config-BVkxo9ab.mjs";
import { a as Phone, i as Share2 } from "../_libs/lucide-react.mjs";
import { r as useI18n } from "./router-C11AcC19.mjs";
import { n as Button } from "./button-BxiXKAJg.mjs";
import { i as CardTitle, n as Card, r as CardMeta, t as AppShell, v as reportSafetyFn } from "./rider-fns-dHkuHKOL.mjs";
import { t as Input } from "./input-DWe54iKd.mjs";
import { n as errorMessage } from "./errors-DFehQenO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/safety-CJoOdfpi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KINDS = [
	"UNSAFE_SITUATION",
	"ROAD_BLOCKAGE",
	"ACCIDENT",
	"CUSTOMER_ISSUE",
	"RESTAURANT_ISSUE",
	"PLATFORM_SUPPORT"
];
function Page() {
	const { t } = useI18n();
	const [note, setNote] = (0, import_react.useState)("");
	const [status, setStatus] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	async function report(kind) {
		try {
			let lat = null;
			let lng = null;
			if (navigator.geolocation) await new Promise((resolve) => {
				navigator.geolocation.getCurrentPosition((p) => {
					lat = p.coords.latitude;
					lng = p.coords.longitude;
					resolve();
				}, () => resolve(), { timeout: 4e3 });
			});
			const row = await reportSafetyFn({ data: {
				kind,
				note,
				lat,
				lng
			} });
			setStatus(row.id);
			setError(null);
		} catch (e) {
			setError(errorMessage(e, t("actionNotConfirmed")));
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: t("safety")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: t("emergency") }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardMeta, {
					className: "mt-2",
					children: t("emergencyNote")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					size: "lg",
					className: "mt-4 w-full",
					variant: "destructive",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: `tel:${DEFAULT_CONFIG.emergencyPhone}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-4" }), DEFAULT_CONFIG.emergencyPhone]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					className: "mt-2 w-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: `tel:${DEFAULT_CONFIG.supportPhone}`,
						children: t("support")
					})
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						className: "w-full",
						onClick: () => {
							const url = window.location.origin;
							if (navigator.share) navigator.share({
								title: "Roshoi location",
								url
							});
							else report("SHARE_LOCATION");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" }), t("shareLocation")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: note,
						onChange: (e) => setNote(e.target.value),
						placeholder: t("message")
					}),
					KINDS.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						className: "w-full",
						onClick: () => void report(k),
						children: k.replaceAll("_", " ")
					}, k)),
					status ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm",
						children: [
							t("ticketRef"),
							" ",
							status.slice(0, 8)
						]
					}) : null,
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-offline",
						children: error
					}) : null
				]
			})
		]
	}) });
}
//#endregion
export { Page as component };
