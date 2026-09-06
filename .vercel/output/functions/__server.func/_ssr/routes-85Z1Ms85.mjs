import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Wallet, u as Clock3 } from "../_libs/lucide-react.mjs";
import { r as useI18n } from "./router-C11AcC19.mjs";
import { n as Button, t as Badge } from "./button-BxiXKAJg.mjs";
import { S as setStatusFn, _ as postLocationFn, a as Skeleton, i as CardTitle, n as Card, p as getHomeFn, r as CardMeta, t as AppShell, w as useCurrentUser, y as respondOfferFn } from "./rider-fns-dHkuHKOL.mjs";
import { t as Input } from "./input-DWe54iKd.mjs";
import { n as errorMessage, r as newIdempotencyKey } from "./errors-DFehQenO.mjs";
import { t as formatPaise } from "./money-CIlgHPun.mjs";
import { t as Label } from "./label-BxdS0xDQ.mjs";
import { n as DeliveryActions, r as MapPane, t as ConfirmDialog } from "./map-pane-KwT_G-Nl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-85Z1Ms85.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useDutyLocation(enabled, deliveryId, intervalSec) {
	(0, import_react.useEffect)(() => {
		if (!enabled || typeof navigator === "undefined" || !navigator.geolocation) {
			window.dispatchEvent(new CustomEvent("roshoi-geo", { detail: { ok: true } }));
			return;
		}
		let lastSent = 0;
		const watch = navigator.geolocation.watchPosition((pos) => {
			window.dispatchEvent(new CustomEvent("roshoi-geo", { detail: { ok: true } }));
			const now = Date.now();
			if (now - lastSent < intervalSec * 1e3) return;
			lastSent = now;
			postLocationFn({ data: {
				lat: pos.coords.latitude,
				lng: pos.coords.longitude,
				accuracyM: pos.coords.accuracy ?? null,
				deliveryId
			} }).catch(() => void 0);
		}, () => {
			window.dispatchEvent(new CustomEvent("roshoi-geo", { detail: { ok: false } }));
		}, {
			enableHighAccuracy: false,
			maximumAge: 15e3,
			timeout: 12e3
		});
		return () => navigator.geolocation.clearWatch(watch);
	}, [
		enabled,
		deliveryId,
		intervalSec
	]);
}
function HomeView() {
	const { t } = useI18n();
	const user = useCurrentUser();
	const [home, setHome] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(false);
	const [confirm, setConfirm] = (0, import_react.useState)(null);
	const [declineReason, setDeclineReason] = (0, import_react.useState)("");
	const [now, setNow] = (0, import_react.useState)(Date.now());
	const load = (0, import_react.useCallback)(async () => {
		try {
			const data = await getHomeFn();
			setHome(data);
			setError(null);
		} catch (e) {
			setError(errorMessage(e, t("connectionLostBody")));
		}
	}, [t]);
	(0, import_react.useEffect)(() => {
		load();
		const id = window.setInterval(() => void load(), 5e3);
		return () => window.clearInterval(id);
	}, [load]);
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => setNow(Date.now()), 250);
		return () => window.clearInterval(id);
	}, []);
	useDutyLocation(Boolean(home && (home.rider.status !== "OFFLINE" || home.active)), home?.active?.id ?? null, 20);
	if (!home && !error) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 w-full rounded-xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32 w-full rounded-xl" })]
	});
	if (!home) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: t("connectionLost") }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardMeta, {
			className: "mt-2",
			children: error
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "mt-4",
			onClick: () => void load(),
			children: t("retry")
		})
	] });
	const status = home.active ? "BUSY" : home.rider.status;
	const remaining = home.offer ? Math.max(0, Math.ceil((new Date(home.offer.expiresAt).getTime() - now) / 1e3)) : 0;
	const onlineMs = home.onlineSince ? now - new Date(home.onlineSince).getTime() : 0;
	const kyc = home.rider.kycStatus;
	async function go(statusNext) {
		setPending(true);
		try {
			await setStatusFn({ data: {
				status: statusNext,
				confirmed: true
			} });
			await load();
		} catch (e) {
			setError(errorMessage(e, t("actionNotConfirmed")));
		} finally {
			setPending(false);
			setConfirm(null);
		}
	}
	async function respond(decision, offer) {
		setPending(true);
		try {
			await respondOfferFn({ data: {
				offerId: offer.id,
				decision,
				reason: declineReason || void 0,
				idempotencyKey: newIdempotencyKey()
			} });
			await load();
		} catch (e) {
			setError(errorMessage(e, t("offerGone")));
		} finally {
			setPending(false);
			setConfirm(null);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-md bg-offline/10 px-3 py-2 text-sm text-offline",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl bg-card p-5 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-widest text-muted-foreground",
							children: t("welcome")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-1 font-display text-3xl leading-none",
							children: home.rider.fullName || user?.displayName || "Partner"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusPill, {
							status,
							online: t("online"),
							offline: t("offline"),
							busy: t("busy")
						})]
					}),
					kyc !== "VERIFIED" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground",
						children: [
							kyc === "UNDER_REVIEW" ? t("underReview") : t("kycHint"),
							" ",
							t("practiceMode")
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-5 grid grid-cols-3 gap-2 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: t("todayEarnings"),
								value: formatPaise(home.todayEarningsPaise)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: t("completed"),
								value: String(home.completedToday)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: t("onlineFor"),
								value: status === "OFFLINE" ? "—" : formatDuration(onlineMs)
							})
						]
					}),
					home.pendingCashPaise > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 flex items-center gap-2 text-sm text-cod",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-4" }),
							t("pendingCash"),
							": ",
							formatPaise(home.pendingCashPaise)
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5",
						children: status === "OFFLINE" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "lg",
							className: "w-full",
							variant: "online",
							disabled: pending,
							onClick: () => setConfirm("online"),
							children: t("goOnline")
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "lg",
							className: "w-full",
							variant: "outline",
							disabled: pending || Boolean(home.active),
							onClick: () => setConfirm("offline"),
							children: t("goOffline")
						})
					})
				]
			}),
			home.active ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl",
							children: t("currentDelivery")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "busy",
							children: home.active.state.replaceAll("_", " ")
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPane, {
						pickup: home.active.pickupLocation,
						drop: home.active.dropLocation,
						pickupLabel: home.active.restaurant.name,
						dropLabel: home.active.customer.area,
						navigateLabel: t("mapsOpen")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeliveryActions, {
						delivery: home.active,
						cash: home.cash,
						simulatedOtp: home.simulatedOtp,
						onChanged: () => void load()
					})
				]
			}) : home.offer && remaining > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfferCard, {
				offer: home.offer,
				remaining,
				pending,
				onAccept: () => void respond("ACCEPT", home.offer),
				onDecline: () => setConfirm("decline")
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: t("offers") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardMeta, {
				className: "mt-2",
				children: status === "ONLINE" ? t("noOffers") : t("homeEmpty")
			})] }),
			home.notifications.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: t("alerts") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-2",
				children: home.notifications.slice(0, 4).map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: n.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-muted-foreground",
						children: n.body
					})]
				}, n.id))
			})] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/assistant",
						className: "underline",
						children: t("assistant")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground",
						children: "·"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/onboarding",
						className: "underline",
						children: t("kyc")
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: confirm === "online",
				title: t("confirmGoOnline"),
				body: t("confirmGoOnlineBody"),
				confirmLabel: t("goOnline"),
				cancelLabel: t("stayOffline"),
				onConfirm: () => void go("ONLINE"),
				onCancel: () => setConfirm(null)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: confirm === "offline",
				title: t("confirmOffline"),
				body: t("confirmOfflineBody"),
				confirmLabel: t("goOffline"),
				cancelLabel: t("stayOnline"),
				danger: true,
				onConfirm: () => void go("OFFLINE"),
				onCancel: () => setConfirm(null)
			}),
			confirm === "decline" && home.offer ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 flex items-end justify-center bg-fg/40 p-4 sm:items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-md rounded-xl bg-card p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl",
							children: t("declineConfirm")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "mt-3 block",
							children: t("declineReason")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "mt-1",
							value: declineReason,
							onChange: (e) => setDeclineReason(e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-col gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "destructive",
								onClick: () => void respond("DECLINE", home.offer),
								children: t("decline")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => setConfirm(null),
								children: t("cancel")
							})]
						})
					]
				})
			}) : null
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-muted px-2 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-xs uppercase tracking-wide text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "mt-1 font-display text-lg tabular-nums",
			children: value
		})]
	});
}
function StatusPill({ status, online, offline, busy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: status === "ONLINE" ? "online" : status === "BUSY" ? "busy" : "offline",
		children: status === "ONLINE" ? online : status === "BUSY" ? busy : offline
	});
}
function formatDuration(ms) {
	const s = Math.floor(ms / 1e3);
	const h = Math.floor(s / 3600);
	const m = Math.floor(s % 3600 / 60);
	return `${h}:${String(m).padStart(2, "0")}`;
}
function OfferCard({ offer, remaining, pending, onAccept, onDecline }) {
	const { t } = useI18n();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-widest text-muted-foreground",
						children: t("offers")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "mt-1",
						children: offer.restaurant.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardMeta, { children: [
						offer.restaurant.area,
						" → ",
						offer.dropArea
					] })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "sim",
					children: t("simulated")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 flex items-center gap-2 font-display text-2xl tabular-nums",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "size-5" }),
					remaining,
					"s"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-4 grid grid-cols-2 gap-2 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted-foreground",
						children: t("expectedPayout")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "tabular-nums",
						children: formatPaise(offer.expectedPayoutPaise)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted-foreground",
						children: t("distance")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
						className: "tabular-nums",
						children: [offer.approxDistanceKm.toFixed(1), " km"]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted-foreground",
						children: t("route")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
						className: "tabular-nums",
						children: [offer.estimatedTotalRouteKm.toFixed(1), " km"]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted-foreground",
						children: t("packages")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: offer.packageCount })] })
				]
			}),
			offer.cod ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
					tone: "cod",
					children: [
						t("cod"),
						" ",
						formatPaise(offer.codAmountPaise)
					]
				})
			}) : null,
			offer.restaurant.specialPickupInstructions ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted-foreground",
				children: offer.restaurant.specialPickupInstructions
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-muted-foreground",
				children: [
					t("estimated"),
					" · ",
					offer.restaurant.preparationStatus
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "lg",
					disabled: pending,
					onClick: onAccept,
					children: t("accept")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "lg",
					variant: "outline",
					disabled: pending,
					onClick: onDecline,
					children: t("decline")
				})]
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeView, {}) });
}
//#endregion
export { Home as component };
