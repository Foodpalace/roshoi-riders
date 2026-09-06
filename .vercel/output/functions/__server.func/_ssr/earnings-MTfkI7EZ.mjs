import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as useI18n } from "./router-C11AcC19.mjs";
import { n as Button, t as Badge } from "./button-BxiXKAJg.mjs";
import { d as getEarningsFn, h as getSettlementsFn, i as CardTitle, n as Card, r as CardMeta, t as AppShell } from "./rider-fns-dHkuHKOL.mjs";
import { n as errorMessage } from "./errors-DFehQenO.mjs";
import { t as formatPaise } from "./money-CIlgHPun.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/earnings-MTfkI7EZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	const { t } = useI18n();
	const [preset, setPreset] = (0, import_react.useState)("today");
	const [data, setData] = (0, import_react.useState)(null);
	const [settlements, setSettlements] = (0, import_react.useState)([]);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		getEarningsFn({ data: { preset } }).then(setData).catch((e) => setError(errorMessage(e, t("connectionLostBody"))));
		getSettlementsFn().then(setSettlements).catch(() => void 0);
	}, [preset, t]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl",
					children: t("earnings")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "sim",
					children: t("simulated")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					"today",
					"yesterday",
					"week",
					"month"
				].map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: preset === p ? "default" : "outline",
					onClick: () => setPreset(p),
					children: p === "today" ? t("today") : p === "yesterday" ? t("yesterday") : p === "week" ? t("thisWeek") : t("thisMonth")
				}, p))
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-offline",
				children: error
			}) : null,
			data ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-widest text-muted-foreground",
					children: t("netPayable")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-4xl tabular-nums",
					children: formatPaise(data.totals.netPayable)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-4 grid grid-cols-2 gap-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: t("payout"),
							v: formatPaise(data.totals.payout)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: t("incentive"),
							v: formatPaise(data.totals.incentive)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: t("adjustment"),
							v: formatPaise(data.totals.adjustment)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: t("deduction"),
							v: formatPaise(data.totals.deduction)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: t("cashCollectedLabel"),
							v: formatPaise(data.totals.cashCollected)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: t("cashReconciled"),
							v: formatPaise(data.totals.cashReconciled)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardMeta, {
					className: "mt-3",
					children: t("simulatedBanner")
				})
			] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: t("statement") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-3 space-y-2",
				children: [data?.lines.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						l.orderCode ?? l.kind,
						" · ",
						l.note
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums",
						children: formatPaise(l.amountPaise)
					})]
				}, l.id)), data && data.lines.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-sm text-muted-foreground",
					children: t("noHistory")
				}) : null]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: t("settlements") }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2",
					children: settlements.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							s.periodStart,
							" → ",
							s.periodEnd
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "tabular-nums",
							children: [
								formatPaise(s.amountPaise),
								" · ",
								s.status,
								s.status === "PAID" && !s.confirmedPaidAt ? " (unconfirmed)" : ""
							]
						})]
					}, s.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/history",
					className: "mt-3 inline-block text-sm underline",
					children: t("history")
				})
			] })
		]
	}) });
}
function Row({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-muted-foreground",
		children: k
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "tabular-nums",
		children: v
	})] });
}
//#endregion
export { Page as component };
