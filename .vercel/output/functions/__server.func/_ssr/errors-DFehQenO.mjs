//#region node_modules/.nitro/vite/services/ssr/assets/errors-DFehQenO.js
function errorMessage(e, fallback) {
	if (e instanceof Error && e.message) {
		if (e.message === "Unauthorized") return fallback;
		return e.message;
	}
	if (e && typeof e === "object" && "message" in e && typeof e.message === "string") return e.message;
	return fallback;
}
function newIdempotencyKey() {
	return crypto.randomUUID();
}
async function compressImage(file, maxBytes) {
	const bitmap = await createImageBitmap(file);
	const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
	const canvas = document.createElement("canvas");
	canvas.width = Math.max(1, Math.round(bitmap.width * scale));
	canvas.height = Math.max(1, Math.round(bitmap.height * scale));
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Could not compress photo");
	ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
	let quality = .72;
	let dataUrl = canvas.toDataURL("image/jpeg", quality);
	while (dataUrl.length * .75 > maxBytes && quality > .4) {
		quality -= .1;
		dataUrl = canvas.toDataURL("image/jpeg", quality);
	}
	const bytes = Math.ceil(dataUrl.length * 3 / 4);
	if (bytes > maxBytes) throw new Error("Photo is too large even after compression");
	return {
		dataUrl,
		contentType: "image/jpeg",
		bytes
	};
}
//#endregion
export { errorMessage as n, newIdempotencyKey as r, compressImage as t };
