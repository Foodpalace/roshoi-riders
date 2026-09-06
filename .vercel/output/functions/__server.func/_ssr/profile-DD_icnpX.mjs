import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as DEFAULT_FLAGS, t as DEFAULT_BRANDING } from "./config-BVkxo9ab.mjs";
import { i as LOCALE_LABELS, r as useI18n } from "./router-C11AcC19.mjs";
import { n as Button, t as Badge } from "./button-BxiXKAJg.mjs";
import { i as CardTitle, n as Card, o as UserButton, r as CardMeta, s as bootstrapRiderFn, t as AppShell, w as useCurrentUser, x as setLocaleFn } from "./rider-fns-dHkuHKOL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-DD_icnpX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	const user = useCurrentUser();
	const { t, locale, setLocale } = useI18n();
	const [rider, setRider] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		bootstrapRiderFn().then(setRider).catch(() => void 0);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: t("profile")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: rider?.fullName || user?.displayName || "Partner" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardMeta, { children: rider?.phone || user?.primaryEmail })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("kyc") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: rider?.kycStatus === "VERIFIED" ? "online" : "busy",
							children: rider?.kycStatus ?? "DRAFT"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [
							rider?.vehicleType,
							" · ",
							rider?.vehicleRegistration || "—"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/onboarding",
						className: "text-sm underline",
						children: t("kyc")
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: t("language") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: Object.keys(LOCALE_LABELS).map((code) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: locale === code ? "default" : "outline",
					onClick: () => {
						setLocale(code);
						setLocaleFn({ data: { locale: code } });
					},
					children: LOCALE_LABELS[code]
				}, code))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: DEFAULT_BRANDING.appName }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardMeta, {
					className: "mt-2",
					children: [
						DEFAULT_BRANDING.legalCompanyName,
						" · ",
						DEFAULT_BRANDING.domain
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: t("legalNote")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 grid grid-cols-2 gap-1 text-xs text-muted-foreground",
					children: Object.entries(DEFAULT_FLAGS).map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						k,
						": ",
						v ? "on" : "off"
					] }, k))
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/assistant",
				className: "inline-block text-sm underline",
				children: t("assistant")
			})
		]
	}) });
}
//#endregion
export { Page as component };
