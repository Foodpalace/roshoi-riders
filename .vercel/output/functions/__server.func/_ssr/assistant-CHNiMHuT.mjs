import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-ipdYAC2x.mjs";
import { a as createSsrRpc, r as useI18n } from "./router-C11AcC19.mjs";
import { n as Button } from "./button-BxiXKAJg.mjs";
import { n as Card, p as getHomeFn, t as AppShell } from "./rider-fns-dHkuHKOL.mjs";
import { t as Input } from "./input-DWe54iKd.mjs";
import { n as errorMessage } from "./errors-DFehQenO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/assistant-CHNiMHuT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var askAssistantFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("5464e230ddd90032ba9d794da765af160a9d1cebb36d9bdbb977f5bcbbca85fc"));
function Page() {
	const { t } = useI18n();
	const [q, setQ] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [pending, setPending] = (0, import_react.useState)(false);
	const [lines, setLines] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		getHomeFn().then((h) => setBusy(Boolean(h.active) || h.rider.status === "BUSY")).catch(() => void 0);
	}, []);
	async function send(e) {
		e.preventDefault();
		if (!q.trim()) return;
		const question = q.trim();
		setQ("");
		setLines((l) => [...l, {
			role: "user",
			text: question
		}]);
		setPending(true);
		try {
			const res = await askAssistantFn({ data: {
				question,
				busy
			} });
			setLines((l) => [...l, {
				role: "assistant",
				text: res.text
			}]);
		} catch (err) {
			setLines((l) => [...l, {
				role: "assistant",
				text: errorMessage(err, t("aiUnavailable"))
			}]);
		} finally {
			setPending(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: t("assistant")
			}),
			busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-busy",
				children: t("aiDriving")
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: lines.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: l.role === "user" ? "bg-muted" : "",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm leading-relaxed",
						children: l.text
					})
				}, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: send,
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: q,
					onChange: (e) => setQ(e.target.value),
					placeholder: t("askAssistant"),
					disabled: pending
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: pending,
					children: t("send")
				})]
			})
		]
	}) });
}
//#endregion
export { Page as component };
