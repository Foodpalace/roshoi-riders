import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, b as Navigate, f as useRouterState, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-ipdYAC2x.mjs";
import { t as DEFAULT_BRANDING } from "./config-BVkxo9ab.mjs";
import { c as House, d as CircleHelp, f as Bike, l as History, p as Banknote, r as Shield } from "../_libs/lucide-react.mjs";
import { a as createSsrRpc, r as useI18n } from "./router-C11AcC19.mjs";
import { i as signOut, t as authClient } from "./client-B40BzJxt.mjs";
import { r as cn, t as Badge } from "./button-BxiXKAJg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rider-fns-dHkuHKOL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	const { data, isPending } = authClient.useSession();
	const user = data?.user;
	return {
		user: user ? {
			id: user.id,
			displayName: user.name ?? null,
			primaryEmail: user.email ?? null,
			profileImageUrl: user.image ?? null,
			isDevFallback: false
		} : null,
		isPending
	};
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
/**
* Auth state components — plain wrappers around `useCurrentUserState()`.
*
* With auth on, visitors are signed out until they authenticate — in the sandbox
* live preview too, which does real sign-in. The shared dev user appears only
* when auth is disabled (`VITE_AUTH_ENABLED=false`, the shipped default).
* While the session is still resolving, gates that care about signed-out state
* render nothing so there's no signed-out flash on hard reload.
*/
/** Where `RedirectToSignIn` sends signed-out visitors. Create this route. */
var SIGN_IN_PATH = "/login";
/**
* Client-side redirect to the sign-in route (TanStack `<Navigate>` — NOT a full
* `window.location` reload). A hard navigation re-bootstraps the SPA and re-runs
* session loading, which feels like a second "Loading…" on /login.
*
* Guard routes by waiting out `isPending` first (see `use-current-user`), then
* render this.
*/
function RedirectToSignIn({ to = SIGN_IN_PATH }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to });
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of).
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
function Skeleton({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("animate-pulse rounded-md bg-muted", className) });
}
function AppShell({ children }) {
	const { user, isPending } = useCurrentUserState();
	const { t } = useI18n();
	const [online, setOnline] = (0, import_react.useState)(true);
	const [geoOk, setGeoOk] = (0, import_react.useState)(true);
	const path = useRouterState({ select: (s) => s.location.pathname });
	(0, import_react.useEffect)(() => {
		const on = () => setOnline(true);
		const off = () => setOnline(false);
		setOnline(navigator.onLine);
		window.addEventListener("online", on);
		window.addEventListener("offline", off);
		return () => {
			window.removeEventListener("online", on);
			window.removeEventListener("offline", off);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const handler = (ev) => {
			const d = ev.detail;
			setGeoOk(d.ok);
		};
		window.addEventListener("roshoi-geo", handler);
		return () => window.removeEventListener("roshoi-geo", handler);
	}, []);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto min-h-dvh max-w-lg p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-2xl",
				children: "Roshoi Partner"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-4 h-16 w-40" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-6 h-48 w-full rounded-xl" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-4 h-24 w-full rounded-xl" })
		]
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	const nav = [
		{
			to: "/",
			icon: House,
			label: t("home")
		},
		{
			to: "/earnings",
			icon: Banknote,
			label: t("earnings")
		},
		{
			to: "/history",
			icon: History,
			label: t("history")
		},
		{
			to: "/safety",
			icon: Shield,
			label: t("safety")
		},
		{
			to: "/profile",
			icon: Bike,
			label: t("profile")
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "bg-sim px-4 py-2 text-center text-xs font-medium tracking-wide text-primary-foreground",
				children: t("simulatedBanner")
			}),
			!online ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-offline px-4 py-2 text-center text-sm text-primary-foreground",
				children: [
					t("connectionLost"),
					" — ",
					t("connectionLostBody")
				]
			}) : null,
			!geoOk ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "bg-busy px-4 py-2 text-center text-sm text-primary-foreground",
				children: t("locationUnavailable")
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: DEFAULT_BRANDING.logoUrl,
						alt: "",
						className: "size-9 rounded-md"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-lg leading-none",
						children: DEFAULT_BRANDING.riderFacingBrand
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: DEFAULT_BRANDING.tagline
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "sim",
							children: t("simulated")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/support",
							className: "grid size-11 place-items-center rounded-md hover:bg-muted",
							"aria-label": t("support"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleHelp, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "hidden sm:block",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto grid max-w-5xl gap-6 px-4 pb-28 lg:grid-cols-[1fr_18rem] lg:pb-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: "hidden lg:block",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sticky top-4 space-y-2 rounded-xl bg-card p-3 shadow-[var(--shadow-border)]",
						children: [nav.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: cn("flex min-h-11 items-center gap-2 rounded-md px-3 text-sm", path === item.to ? "bg-primary text-primary-foreground" : "hover:bg-muted"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-4" }), item.label]
						}, item.to)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/assistant",
							className: "flex min-h-11 items-center gap-2 rounded-md px-3 text-sm hover:bg-muted",
							children: t("assistant")
						})]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mx-auto grid max-w-lg grid-cols-5",
					children: nav.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: item.to,
						className: cn("flex min-h-14 flex-col items-center justify-center gap-1 text-[11px]", path === item.to ? "text-primary" : "text-muted-foreground"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-5" }), item.label]
					}) }, item.to))
				})
			})
		]
	});
}
function Card({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-xl bg-card p-4 text-fg shadow-[var(--shadow-border)]", className),
		...props
	});
}
function CardTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: cn("font-display text-lg font-medium tracking-tight", className),
		...props
	});
}
function CardMeta({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
createServerFn({ method: "GET" }).handler(createSsrRpc("99b14eb7eab9afec3099f10118a3095c15ae582c0df9e3cc95ea045f1660fb0e"));
var bootstrapRiderFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("48682df83d6da402da9522f9aecead23e80bc9357dab637ff7190133266af13b"));
var getHomeFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("6a897c95cb9fdaa074503d87c61bf06809ce8f5311b89f9c24121ff6250007f4"));
var saveProfileFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("f968094e9af749aef090d34cdf04073a12f813244730922f7b84cff9434de820"));
var submitKycFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("8c6cb121d96bdb5ad4df1dce84b6706158c2fa361e1e2c985df10f72209607a9"));
var setStatusFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("511fd4705ed87e637d1544629f9c353ee4c7786de1c52143f1fef1c8d10d1d45"));
var respondOfferFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("2d7fac9a7c0ef58991f78d1dc55c1c9aa53902515155f777ca295cc1ad94867a"));
var deliveryActionFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("79b0055f57016baf02e5e2e887da2c274fff000b25c5db8ae6d66d930d5dd93f"));
var postLocationFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("7c7b8772e08e688b3c062148f6b9633c0d965ad9e930cb98626c134161edb11e"));
var getEarningsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("37c9d780d1b85c650bba6ea1caac9656fb76272f73ae02fb87e5bbe06b9f7657"));
var getHistoryFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("7eb694cfbc5dba54ed933bd44aecea4576e3a08014fd7cda734f12cf650a3e3a"));
var getSettlementsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("92a82d9d9dc4adb491fd97d083f29bac2cd12b10eb915160551bcee996101a31"));
var getPerformanceFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("511d05824ec719710f4ff666fd91db492b4d80df12c78a4726db5f226dae41fd"));
var createTicketFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("82d5964be1b9c20175447e9bd69333c89bca829bb04005c8d1d483961f5d9eb6"));
var listTicketsFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("55a95a6351d91d159115cb78952c27b39bd791a46ca0cbd4ef51af5550234cb7"));
var reportSafetyFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("3a2f4ee43f0148fc15652e18e0d81e5bcda14e905e5999dbe87d0b84c76dc7c0"));
createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("0e984367e1fb768bb4af66f1123e00565367a307079eedca064abd9e484d2482"));
var setLocaleFn = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("6dbec1a34c0a71ecbb15208d3a55a31da9bc84ebee169cfe9ac846ef5a44db3c"));
var getDeliveryFn = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("18387f9a7402c72c72afd5b44d9f27dce57f6b197eb8d1fff5576018ded5b445"));
createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("6d7d5e8d91d454409a35fe230025b9053e47e6595567f74bfd99e0dc5b9451d3"));
//#endregion
export { submitKycFn as C, setStatusFn as S, postLocationFn as _, Skeleton as a, saveProfileFn as b, createTicketFn as c, getEarningsFn as d, getHistoryFn as f, listTicketsFn as g, getSettlementsFn as h, CardTitle as i, deliveryActionFn as l, getPerformanceFn as m, Card as n, UserButton as o, getHomeFn as p, CardMeta as r, bootstrapRiderFn as s, AppShell as t, getDeliveryFn as u, reportSafetyFn as v, useCurrentUser as w, setLocaleFn as x, respondOfferFn as y };
