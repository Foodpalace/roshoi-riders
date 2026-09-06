import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Route$1, r as useI18n } from "./router-C11AcC19.mjs";
import { t as Badge } from "./button-BxiXKAJg.mjs";
import { t as AppShell, u as getDeliveryFn } from "./rider-fns-dHkuHKOL.mjs";
import { n as errorMessage } from "./errors-DFehQenO.mjs";
import { n as DeliveryActions, r as MapPane } from "./map-pane-KwT_G-Nl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/delivery._id-eMlTAsra.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	const { id } = Route$1.useParams();
	const { t } = useI18n();
	const [pack, setPack] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(() => {
		getDeliveryFn({ data: { deliveryId: id } }).then(setPack).catch((e) => setError(errorMessage(e, t("forbidden"))));
	}, [id, t]);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-offline",
		children: error
	}) : null, pack ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl",
					children: pack.delivery.orderCode
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "busy",
					children: pack.delivery.state.replaceAll("_", " ")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPane, {
				pickup: pack.delivery.pickupLocation,
				drop: pack.delivery.dropLocation,
				pickupLabel: pack.delivery.restaurant.name,
				dropLabel: pack.delivery.customer.area,
				navigateLabel: t("mapsOpen")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeliveryActions, {
				delivery: pack.delivery,
				cash: null,
				simulatedOtp: pack.simulatedOtp,
				onChanged: load
			})
		]
	}) : null] });
}
//#endregion
export { Page as component };
