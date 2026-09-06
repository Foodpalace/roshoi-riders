import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as cn } from "./button-BxiXKAJg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/input-DWe54iKd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Input = (0, import_react.forwardRef)(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
	ref,
	className: cn("flex h-11 w-full rounded-md border border-border bg-surface px-3 text-base text-fg placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className),
	...props
}));
Input.displayName = "Input";
//#endregion
export { Input as t };
