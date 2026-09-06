import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as GROK_PROVIDERS } from "./server-CeCJAsrv.mjs";
import { t as DEFAULT_BRANDING } from "./config-BVkxo9ab.mjs";
import { r as useI18n } from "./router-C11AcC19.mjs";
import { r as signIn, t as authClient } from "./client-B40BzJxt.mjs";
import { n as Button, t as Badge } from "./button-BxiXKAJg.mjs";
import { t as Input } from "./input-DWe54iKd.mjs";
import { t as Label } from "./label-BxdS0xDQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-zHfNb-DL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const { t, locale, setLocale } = useI18n();
	const [mode, setMode] = (0, import_react.useState)("in");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(false);
	async function onEmail(e) {
		e.preventDefault();
		setPending(true);
		setError(null);
		try {
			if (mode === "up") {
				const { error: err } = await authClient.signUp.email({
					email,
					password,
					name: name || email.split("@")[0] || "Partner",
					callbackURL: "/"
				});
				if (err) throw new Error(err.message);
			} else {
				const { error: err } = await authClient.signIn.email({
					email,
					password,
					callbackURL: "/"
				});
				if (err) throw new Error(err.message);
			}
			window.location.href = "/";
		} catch (err) {
			setError(err instanceof Error ? err.message : t("unauthorized"));
		} finally {
			setPending(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto min-h-dvh max-w-lg px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "sim",
					children: t("simulated")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-sm underline",
					onClick: () => setLocale(locale === "en" ? "bn" : "en"),
					children: locale === "en" ? "বাংলা" : "English"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: DEFAULT_BRANDING.logoUrl,
				alt: "",
				className: "size-14 rounded-lg"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-xs uppercase tracking-[0.25em] text-muted-foreground",
				children: DEFAULT_BRANDING.legalCompanyName
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl leading-none",
				children: DEFAULT_BRANDING.riderFacingBrand
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-sm text-muted-foreground",
				children: t("loginLead")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-muted-foreground",
				children: t("simulatedBanner")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 space-y-3",
				children: GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					className: "w-full",
					onClick: () => signIn(p.providerId, { callbackURL: "/" }),
					children: p.idp === "twitter" ? t("continueX") : t("continueGoogle")
				}, p.providerId))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "my-6 text-center text-xs uppercase tracking-widest text-muted-foreground",
				children: t("or")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: onEmail,
				className: "space-y-3",
				children: [
					mode === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("name") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "mt-1",
						value: name,
						onChange: (e) => setName(e.target.value),
						autoComplete: "name"
					})] }) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("email") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "mt-1",
						type: "email",
						required: true,
						value: email,
						onChange: (e) => setEmail(e.target.value),
						autoComplete: "email"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("password") }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "mt-1",
							type: "password",
							required: true,
							minLength: 8,
							value: password,
							onChange: (e) => setPassword(e.target.value),
							autoComplete: mode === "up" ? "new-password" : "current-password"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: t("passwordHint")
						})
					] }),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-offline",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "lg",
						className: "w-full",
						disabled: pending,
						type: "submit",
						children: mode === "up" ? t("signUp") : t("signIn")
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "mt-4 text-sm underline",
				onClick: () => setMode(mode === "up" ? "in" : "up"),
				children: mode === "up" ? t("haveAccount") : t("needAccount")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-10 text-xs text-muted-foreground",
				children: t("legalNote")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "mt-4 inline-block text-sm underline",
				children: DEFAULT_BRANDING.domain
			})
		]
	});
}
//#endregion
export { Login as component };
