import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-BxiXKAJg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function Badge({ className, tone = "muted", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide", {
			muted: "bg-muted text-muted-foreground",
			online: "bg-online/15 text-online",
			offline: "bg-offline/10 text-offline",
			busy: "bg-busy/15 text-busy",
			cod: "bg-cod/12 text-cod",
			sim: "bg-paper text-sim"
		}[tone], className),
		...props
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[opacity,transform,background-color] duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-11 px-4", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]",
			secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
			outline: "border border-border bg-surface text-fg hover:bg-muted",
			ghost: "text-fg hover:bg-muted",
			destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
			online: "bg-online text-primary-foreground hover:opacity-90 active:scale-[0.98]"
		},
		size: {
			default: "h-11",
			lg: "h-14 rounded-lg px-5 text-base",
			sm: "h-10 text-sm",
			icon: "size-11 p-0"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = (0, import_react.forwardRef)(({ className, variant, size, asChild, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		ref,
		...props
	});
});
Button.displayName = "Button";
//#endregion
export { Button as n, cn as r, Badge as t };
