import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as Navigation, s as MapPin } from "../_libs/lucide-react.mjs";
import { r as useI18n } from "./router-C11AcC19.mjs";
import { n as Button, t as Badge } from "./button-BxiXKAJg.mjs";
import { l as deliveryActionFn, n as Card, r as CardMeta } from "./rider-fns-dHkuHKOL.mjs";
import { t as Input } from "./input-DWe54iKd.mjs";
import { n as errorMessage, r as newIdempotencyKey, t as compressImage } from "./errors-DFehQenO.mjs";
import { t as formatPaise } from "./money-CIlgHPun.mjs";
import { t as Label } from "./label-BxdS0xDQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/map-pane-KwT_G-Nl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ConfirmDialog(props) {
	if (!props.open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-end justify-center bg-fg/40 p-4 sm:items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "dialog",
			"aria-modal": "true",
			className: "w-full max-w-md rounded-xl bg-card p-5 shadow-[var(--shadow-border)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-medium",
					children: props.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted-foreground",
					children: props.body
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex flex-col gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: props.danger ? "destructive" : "default",
						size: "lg",
						onClick: props.onConfirm,
						children: props.confirmLabel
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "lg",
						onClick: props.onCancel,
						children: props.cancelLabel
					})]
				})
			]
		})
	});
}
function DeliveryActions({ delivery, cash, simulatedOtp, onChanged }) {
	const { t } = useI18n();
	const [code, setCode] = (0, import_react.useState)("");
	const [otp, setOtp] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [cancelOpen, setCancelOpen] = (0, import_react.useState)(false);
	const [reason, setReason] = (0, import_react.useState)("vehicle problem");
	async function act(action, extra = {}) {
		setPending(true);
		setError(null);
		try {
			await deliveryActionFn({ data: {
				deliveryId: delivery.id,
				action,
				idempotencyKey: newIdempotencyKey(),
				...extra
			} });
			onChanged();
		} catch (e) {
			setError(errorMessage(e, t("actionNotConfirmed")));
		} finally {
			setPending(false);
		}
	}
	async function onPhoto(file) {
		if (!file) return;
		setPending(true);
		try {
			const compressed = await compressImage(file, 18e4);
			await deliveryActionFn({ data: {
				deliveryId: delivery.id,
				action: "POD",
				idempotencyKey: newIdempotencyKey(),
				pod: {
					method: "PHOTO",
					contentType: compressed.contentType,
					dataUrl: compressed.dataUrl,
					bytes: compressed.bytes
				}
			} });
			onChanged();
		} catch (e) {
			setError(errorMessage(e, t("actionNotConfirmed")));
		} finally {
			setPending(false);
		}
	}
	const d = delivery;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-medium",
					children: [
						t("order"),
						" ",
						d.orderCode
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "sim",
					children: t("simulated")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm",
				children: [
					d.restaurant.name,
					" · ",
					d.packageCount,
					" ",
					t("packages")
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: d.customer.area
			}),
			d.customer.address ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm",
				children: d.customer.address
			}) : null,
			d.customer.instructions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm",
				children: d.customer.instructions
			}) : null,
			d.customer.contactAllowed && d.customer.contactMasked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: d.customer.contactMasked
			}) : null,
			d.cod ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
				tone: "cod",
				children: [
					t("collectCash"),
					" ",
					formatPaise(d.codAmountPaise)
				]
			}) }) : null,
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-offline",
				children: error
			}) : null,
			d.state === "ACCEPTED" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "lg",
				className: "w-full",
				disabled: pending,
				onClick: () => void act("ARRIVING"),
				children: [
					t("navigate"),
					" — ",
					d.restaurant.name
				]
			}) : null,
			d.state === "ARRIVING_AT_RESTAURANT" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "lg",
				className: "w-full",
				disabled: pending,
				onClick: () => void act("ARRIVE_RESTAURANT"),
				children: t("imAtRestaurant")
			}) : null,
			d.state === "ARRIVED_AT_RESTAURANT" || d.state === "RESTAURANT_NOT_READY" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm",
						children: [
							t("pickupCode"),
							": ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono tabular-nums",
								children: d.pickupCode
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("pickupCode") }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "numeric",
						value: code,
						onChange: (e) => setCode(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "lg",
						className: "w-full",
						disabled: pending,
						onClick: () => void act("PICKUP", { pickupCode: code }),
						children: t("pickUp")
					}),
					d.state === "ARRIVED_AT_RESTAURANT" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						className: "w-full",
						disabled: pending,
						onClick: () => void act("NOT_READY"),
						children: t("restaurantNotReady")
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardMeta, { children: t("waitingRestaurant") })
				]
			}) : null,
			d.state === "PICKED_UP" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "lg",
				className: "w-full",
				disabled: pending,
				onClick: () => void act("START"),
				children: t("startDelivery")
			}) : null,
			d.state === "ON_THE_WAY" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "lg",
					className: "w-full",
					disabled: pending,
					onClick: () => void act("ARRIVE_CUSTOMER"),
					children: t("iveArrived")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					className: "w-full",
					disabled: pending,
					onClick: () => void act("UNAVAILABLE"),
					children: t("customerUnavailable")
				})]
			}) : null,
			d.state === "ARRIVED_AT_CUSTOMER" || d.state === "SUPPORT_ESCALATION" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					d.cod && cash && cash.state === "EXPECTED" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: t("cashMustMatch")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "lg",
						className: "mt-2 w-full",
						disabled: pending,
						onClick: () => void act("COLLECT_CASH"),
						children: [
							t("cashCollected"),
							" ",
							formatPaise(cash.expectedPaise)
						]
					})] }) : null,
					simulatedOtp ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "rounded-md bg-muted px-3 py-2 text-sm",
						children: [
							t("simOtpHint"),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono tabular-nums",
								children: simulatedOtp
							})
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("enterOtp") }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						inputMode: "numeric",
						autoComplete: "one-time-code",
						value: otp,
						onChange: (e) => setOtp(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "block",
						children: t("photoPod")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "file",
						accept: "image/jpeg,image/png,image/webp",
						onChange: (e) => void onPhoto(e.target.files?.[0])
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "lg",
						className: "w-full",
						disabled: pending,
						onClick: () => void act("DELIVER", { otp }),
						children: t("confirmDelivered")
					})
				]
			}) : null,
			d.state === "CUSTOMER_UNAVAILABLE" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardMeta, { children: [
					t("waitTimer"),
					" · ",
					t("contactAttempt"),
					" (",
					d.contactAttempts,
					")"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "w-full",
					disabled: pending,
					onClick: () => void act("CONTACT"),
					children: t("contactAttempt")
				})]
			}) : null,
			d.state !== "DELIVERED" && d.state !== "RIDER_CANCELLED" && d.state !== "ORDER_CANCELLED" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				className: "w-full text-offline",
				onClick: () => setCancelOpen(true),
				children: t("cancelDelivery")
			}) : null,
			cancelOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2 rounded-lg bg-muted p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("cancelReason") }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "h-11 w-full rounded-md border border-border bg-surface px-3",
						value: reason,
						onChange: (e) => setReason(e.target.value),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "vehicle problem",
								children: t("vehicleProblem")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "safety issue",
								children: t("safetyIssue")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "wrong assignment",
								children: t("wrongAssignment")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "restaurant issue",
								children: t("restaurantIssue")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "customer issue",
								children: t("customerIssue")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "other",
								children: t("other")
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
						open: true,
						title: t("cancelDelivery"),
						body: t("cancelReason"),
						confirmLabel: t("confirm"),
						cancelLabel: t("cancel"),
						danger: true,
						onCancel: () => setCancelOpen(false),
						onConfirm: () => {
							setCancelOpen(false);
							act("CANCEL", {
								reason,
								confirmed: true
							});
						}
					})
				]
			}) : null
		]
	});
}
function mapsUrl(point, label) {
	const q = encodeURIComponent(`${point.lat},${point.lng} (${label})`);
	return `https://www.openstreetmap.org/?mlat=${point.lat}&mlon=${point.lng}#map=16/${point.lat}/${point.lng}&q=${q}`;
}
function geoUrl(point) {
	return `geo:${point.lat},${point.lng}`;
}
function project(p, all) {
	const lats = all.map((x) => x.lat);
	const lngs = all.map((x) => x.lng);
	const minLat = Math.min(...lats) - .01;
	const maxLat = Math.max(...lats) + .01;
	const minLng = Math.min(...lngs) - .01;
	const maxLng = Math.max(...lngs) + .01;
	return {
		x: (p.lng - minLng) / (maxLng - minLng) * 100,
		y: (1 - (p.lat - minLat) / (maxLat - minLat)) * 100
	};
}
function MapPane({ pickup, drop, current, pickupLabel, dropLabel, navigateLabel }) {
	const points = [
		pickup,
		drop,
		current
	].filter(Boolean);
	const target = drop ?? pickup;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "overflow-hidden rounded-lg bg-paper",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 100 72",
			className: "h-44 w-full",
			role: "img",
			"aria-label": "Route",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					width: "100",
					height: "72",
					className: "fill-paper"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					className: "stroke-border",
					strokeWidth: "0.4",
					children: [Array.from({ length: 6 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: "0",
						y1: i * 12,
						x2: "100",
						y2: i * 12
					}, `h${i}`)), Array.from({ length: 8 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: i * 12.5,
						y1: "0",
						x2: i * 12.5,
						y2: "72"
					}, `v${i}`))]
				}),
				points.length >= 2 && pickup && drop ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: project(pickup, points).x,
					y1: project(pickup, points).y,
					x2: project(drop, points).x,
					y2: project(drop, points).y,
					className: "stroke-primary",
					strokeWidth: "1.2",
					strokeDasharray: "2 1.5"
				}) : null,
				pickup && points.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: project(pickup, points).x,
					cy: project(pickup, points).y,
					r: "2.4",
					className: "fill-primary"
				}) : null,
				drop && points.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: project(drop, points).x,
					cy: project(drop, points).y,
					r: "2.4",
					className: "fill-cod"
				}) : null,
				current && points.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: project(current, points).x,
					cy: project(current, points).y,
					r: "2",
					className: "fill-fg"
				}) : null
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-2 px-3 py-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center gap-1 text-xs text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5" }),
						pickupLabel,
						" → ",
						dropLabel
					]
				}),
				target ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "ghost",
					size: "sm",
					className: "min-h-10",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: mapsUrl(target, dropLabel),
						target: "_blank",
						rel: "noreferrer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, { className: "size-4" }), navigateLabel]
					})
				}) : null,
				target ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("link", {
					rel: "alternate",
					href: geoUrl(target)
				}) : null
			]
		})]
	});
}
//#endregion
export { DeliveryActions as n, MapPane as r, ConfirmDialog as t };
