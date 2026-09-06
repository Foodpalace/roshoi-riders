import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as useI18n } from "./router-C11AcC19.mjs";
import { n as Button, t as Badge } from "./button-BxiXKAJg.mjs";
import { f as getHistoryFn, m as getPerformanceFn, n as Card, t as AppShell } from "./rider-fns-dHkuHKOL.mjs";
import { n as errorMessage } from "./errors-DFehQenO.mjs";
import { t as formatPaise } from "./money-CIlgHPun.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/history-B1dioIuC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	const { t } = useI18n();
	const [preset, setPreset] = (0, import_react.useState)("week");
	const [rows, setRows] = (0, import_react.useState)([]);
	const [perf, setPerf] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		getHistoryFn({ data: { preset } }).then(setRows).catch((e) => setError(errorMessage(e, t("connectionLostBody"))));
		getPerformanceFn().then(setPerf).catch(() => void 0);
	}, [preset, t]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: t("history")
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
			perf ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "grid grid-cols-2 gap-3 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						t("completed"),
						": ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums",
							children: perf.completed
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						t("acceptanceRate"),
						": ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums",
							children: pct(perf.accepted, perf.offered)
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						t("cancelRate"),
						": ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums",
							children: pct(perf.cancelled, perf.accepted)
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						t("perOrder"),
						": ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums",
							children: formatPaise(perf.earningsPerOrderPaise)
						})
					] })
				]
			}) : null,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-offline",
				children: error
			}) : null,
			rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: t("noHistory")
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/delivery/$id",
					params: { id: r.delivery.id },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: r.delivery.orderCode
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: [
								r.delivery.restaurant.name,
								" · ",
								r.delivery.customer.area
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: "muted",
								children: r.delivery.state
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 tabular-nums text-sm",
								children: formatPaise(r.payout)
							})]
						})]
					})
				}) }, r.delivery.id))
			})
		]
	}) });
}
function pct(n, d) {
	if (!d) return "—";
	return `${Math.round(n / d * 100)}%`;
}
//#endregion
export { Page as component };
