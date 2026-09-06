import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as useI18n } from "./router-C11AcC19.mjs";
import { n as Button, t as Badge } from "./button-BxiXKAJg.mjs";
import { C as submitKycFn, b as saveProfileFn, i as CardTitle, n as Card, r as CardMeta, s as bootstrapRiderFn, t as AppShell } from "./rider-fns-dHkuHKOL.mjs";
import { t as Input } from "./input-DWe54iKd.mjs";
import { n as errorMessage } from "./errors-DFehQenO.mjs";
import { t as ZONES } from "./catalog-CBGXwXS0.mjs";
import { t as Label } from "./label-BxdS0xDQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/onboarding-alYBe4D3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	const { t } = useI18n();
	const [rider, setRider] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		bootstrapRiderFn().then(setRider).catch((e) => setError(errorMessage(e, t("connectionLostBody"))));
	}, [t]);
	async function save(patch) {
		setPending(true);
		try {
			const next = await saveProfileFn({ data: patch });
			setRider(next);
			setError(null);
		} catch (e) {
			setError(errorMessage(e, t("actionNotConfirmed")));
		} finally {
			setPending(false);
		}
	}
	async function submit() {
		setPending(true);
		try {
			setRider(await submitKycFn());
		} catch (e) {
			setError(errorMessage(e, t("actionNotConfirmed")));
		} finally {
			setPending(false);
		}
	}
	if (!rider) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: error ?? "…"
	}) });
	const field = (key, label, extra = {}) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
		className: "mt-1",
		value: String(rider[key] ?? ""),
		onChange: (e) => setRider({
			...rider,
			[key]: e.target.value
		}),
		onBlur: () => void save({ [key]: rider[key] }),
		...extra
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl",
					children: t("kyc")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: rider.kycStatus === "VERIFIED" ? "online" : "busy",
					children: rider.kycStatus
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: t("kycHint")
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-offline",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: t("profile") }),
					field("fullName", t("name")),
					field("phone", t("phone"), { inputMode: "tel" }),
					field("email", t("email"), { type: "email" }),
					field("address", t("address")),
					field("emergencyName", t("emergencyContact")),
					field("emergencyPhone", t("phone"), { inputMode: "tel" }),
					field("dateOfBirth", t("dob"), { type: "date" }),
					field("governmentIdLast4", t("govId"), {
						maxLength: 4,
						inputMode: "numeric"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: t("vehicle") }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("vehicleType") }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "h-11 w-full rounded-md border border-border bg-surface px-3",
						value: rider.vehicleType,
						onChange: (e) => {
							const vehicleType = e.target.value;
							setRider({
								...rider,
								vehicleType
							});
							save({ vehicleType });
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "MOTORCYCLE",
								children: "Motorcycle"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "SCOOTER",
								children: "Scooter"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "BICYCLE",
								children: "Bicycle"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "WALKING",
								children: "Walking"
							})
						]
					}),
					field("vehicleRegistration", t("registration")),
					field("licenceNumber", t("licence")),
					field("insuranceRef", t("insurance")),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("brandTag") }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "h-11 w-full rounded-md border border-border bg-surface px-3",
						value: rider.riderType,
						onChange: (e) => {
							const riderType = e.target.value;
							setRider({
								...rider,
								riderType
							});
							save({ riderType });
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "DELIVERY_PARTNER",
								children: "Delivery partner"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "PART_TIME",
								children: "Part-time"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "FULL_TIME",
								children: "Full-time"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: t("settlements") }),
					field("payoutUpi", t("upi")),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("zones") }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: ZONES.map((z) => {
							const on = rider.preferredZones.includes(z);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: `min-h-11 rounded-full px-3 text-sm ${on ? "bg-primary text-primary-foreground" : "bg-muted"}`,
								onClick: () => {
									const preferredZones = on ? rider.preferredZones.filter((x) => x !== z) : [...rider.preferredZones, z];
									setRider({
										...rider,
										preferredZones
									});
									save({ preferredZones });
								},
								children: z
							}, z);
						})
					}),
					field("availabilityNotes", t("availability"))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardMeta, { children: t("legalNote") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "lg",
				className: "mt-4 w-full",
				disabled: pending,
				onClick: () => void submit(),
				children: t("submitKyc")
			})] })
		]
	}) });
}
//#endregion
export { Page as component };
