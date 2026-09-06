import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as useI18n } from "./router-C11AcC19.mjs";
import { n as Button, t as Badge } from "./button-BxiXKAJg.mjs";
import { c as createTicketFn, g as listTicketsFn, i as CardTitle, n as Card, t as AppShell } from "./rider-fns-dHkuHKOL.mjs";
import { t as Input } from "./input-DWe54iKd.mjs";
import { n as errorMessage, r as newIdempotencyKey } from "./errors-DFehQenO.mjs";
import { t as Label } from "./label-BxdS0xDQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/support-_rzqTWLt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TOPICS = [
	"ORDER_ISSUE",
	"RESTAURANT_ISSUE",
	"CUSTOMER_UNAVAILABLE",
	"CASH_DISPUTE",
	"PAYMENT_ISSUE",
	"APP_ISSUE",
	"VEHICLE_PROBLEM",
	"SAFETY_ISSUE",
	"OTHER"
];
function Page() {
	const { t } = useI18n();
	const [topic, setTopic] = (0, import_react.useState)("ORDER_ISSUE");
	const [message, setMessage] = (0, import_react.useState)("");
	const [tickets, setTickets] = (0, import_react.useState)([]);
	const [error, setError] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(false);
	async function load() {
		try {
			setTickets(await listTicketsFn());
		} catch (e) {
			setError(errorMessage(e, t("connectionLostBody")));
		}
	}
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	async function submit(e) {
		e.preventDefault();
		setPending(true);
		try {
			await createTicketFn({ data: {
				topic,
				message,
				idempotencyKey: newIdempotencyKey()
			} });
			setMessage("");
			await load();
		} catch (err) {
			setError(errorMessage(err, t("actionNotConfirmed")));
		} finally {
			setPending(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: t("support")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("createTicket") }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: "h-11 w-full rounded-md border border-border bg-surface px-3",
						value: topic,
						onChange: (e) => setTopic(e.target.value),
						children: TOPICS.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: x,
							children: x.replaceAll("_", " ")
						}, x))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						required: true,
						value: message,
						onChange: (e) => setMessage(e.target.value),
						placeholder: t("message")
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-offline",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "lg",
						className: "w-full",
						disabled: pending,
						type: "submit",
						children: t("createTicket")
					})
				]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: tickets.map((ticket) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
							className: "text-base",
							children: [
								t("ticketRef"),
								" ",
								ticket.id.slice(0, 8)
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "muted",
							children: ticket.status
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm",
						children: ticket.topic.replaceAll("_", " ")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: ticket.message
					})
				] }) }, ticket.id))
			})
		]
	}) });
}
//#endregion
export { Page as component };
