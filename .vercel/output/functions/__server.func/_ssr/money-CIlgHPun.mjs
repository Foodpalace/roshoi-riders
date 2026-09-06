//#region node_modules/.nitro/vite/services/ssr/assets/money-CIlgHPun.js
function formatPaise(amountPaise, locale = "en-IN") {
	const sign = amountPaise < 0 ? "-" : "";
	const abs = Math.abs(amountPaise);
	const rupees = Math.floor(abs / 100);
	const frac = abs % 100;
	return `${sign}₹${rupees.toLocaleString(locale)}.${String(frac).padStart(2, "0")}`;
}
//#endregion
export { formatPaise as t };
